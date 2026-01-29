import { useState, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import { extractInvoiceData } from '../utils/ocrFieldMapper';

/**
 * 图片预处理 - 提高 OCR 识别率
 */
async function preprocessImage(imageSource) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 放大图片以提高识别率
            const scale = Math.max(1, 2000 / Math.max(img.width, img.height));
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            // 绘制图片
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 获取图像数据进行处理
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // 灰度化 + 增强对比度 + 二值化
            for (let i = 0; i < data.length; i += 4) {
                // 转灰度
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

                // 增强对比度
                const contrast = 1.5;
                const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));
                let enhanced = factor * (gray - 128) + 128;
                enhanced = Math.max(0, Math.min(255, enhanced));

                // 自适应二值化阈值
                const threshold = 140;
                const binary = enhanced > threshold ? 255 : 0;

                data[i] = binary;
                data[i + 1] = binary;
                data[i + 2] = binary;
            }

            ctx.putImageData(imageData, 0, 0);

            resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = () => {
            // 如果处理失败，返回原图
            resolve(imageSource);
        };

        img.src = imageSource;
    });
}

/**
 * OCR 处理 Hook - 增强版
 */
export function useOCR() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const processImage = useCallback(async (imageSource) => {
        setIsProcessing(true);
        setProgress(0);
        setError(null);
        setResult(null);

        try {
            // 步骤 1: 预处理图片
            setStatus('正在优化图片质量...');
            setProgress(10);
            const processedImage = await preprocessImage(imageSource);

            setStatus('正在加载 OCR 引擎...');
            setProgress(20);

            // 步骤 2: 使用优化的配置进行 OCR
            const ocrResult = await Tesseract.recognize(
                processedImage,
                'eng', // 先只用英文，识别率更高
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            setProgress(20 + Math.round(m.progress * 70));
                            setStatus('正在识别文字...');
                        } else if (m.status === 'loading language traineddata') {
                            setStatus('正在加载语言包...');
                        }
                    },
                    // 优化参数
                    tessedit_pageseg_mode: '6', // 假设为单一文本块
                    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:-$#@&/() ',
                    preserve_interword_spaces: '1',
                }
            );

            setStatus('正在提取发票信息...');
            setProgress(95);

            const extractedData = extractInvoiceData(ocrResult.data.text);

            setResult({
                text: ocrResult.data.text,
                data: extractedData,
                confidence: ocrResult.data.confidence
            });

            setStatus('识别完成');
            setProgress(100);
        } catch (err) {
            console.error('OCR error:', err);
            setError(err.message || '识别失败，请重试');
            setStatus('识别失败');
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const reset = useCallback(() => {
        setIsProcessing(false);
        setProgress(0);
        setStatus('');
        setResult(null);
        setError(null);
    }, []);

    return {
        isProcessing,
        progress,
        status,
        result,
        error,
        processImage,
        reset
    };
}
