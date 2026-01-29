import { Link } from 'react-router-dom';

export default function HomePage() {
    return (
        <div>
            {/* 英雄区 */}
            <section className="hero">
                <h1 className="hero-title">专业发票生成器</h1>
                <p className="hero-subtitle">
                    为美国华人企业主打造的免费发票工具。中文界面，英文发票，无需登录，数据安全保存在本地。
                </p>
                <div className="hero-actions">
                    <Link to="/create" className="btn btn-primary btn-lg">
                        ✏️ 手动创建发票
                    </Link>
                    <Link to="/scan" className="btn btn-secondary btn-lg">
                        📷 扫描手写发票
                    </Link>
                </div>
            </section>

            {/* 功能卡片 */}
            <section className="feature-cards">
                <Link to="/create" className="feature-card">
                    <div className="feature-icon">📝</div>
                    <h3 className="feature-title">手动创建</h3>
                    <p className="feature-description">
                        填写表单快速创建专业发票，支持多行项目和自动计算
                    </p>
                </Link>

                <Link to="/scan" className="feature-card">
                    <div className="feature-icon">📸</div>
                    <h3 className="feature-title">扫描转换</h3>
                    <p className="feature-description">
                        上传或拍摄手写发票照片，自动识别并转换为数字发票
                    </p>
                </Link>

                <div className="feature-card" style={{ cursor: 'default' }}>
                    <div className="feature-icon">💾</div>
                    <h3 className="feature-title">本地存储</h3>
                    <p className="feature-description">
                        客户和公司信息保存在浏览器中，无需登录，隐私安全
                    </p>
                </div>

                <div className="feature-card" style={{ cursor: 'default' }}>
                    <div className="feature-icon">📄</div>
                    <h3 className="feature-title">PDF 导出</h3>
                    <p className="feature-description">
                        一键导出高质量 PDF，适合打印和通过邮件发送
                    </p>
                </div>
            </section>

            {/* 使用说明 */}
            <section style={{ marginTop: '64px', textAlign: 'center' }}>
                <h2 style={{
                    marginBottom: '32px',
                    fontSize: '1.75rem',
                    fontWeight: '700'
                }}>
                    如何使用
                </h2>

                <div className="steps-container">
                    <div className="steps">
                        <div className="step completed">
                            <div className="step-circle">1</div>
                            <span className="step-label">选择方式</span>
                        </div>
                        <div className="step-line"></div>
                        <div className="step completed">
                            <div className="step-circle">2</div>
                            <span className="step-label">填写信息</span>
                        </div>
                        <div className="step-line"></div>
                        <div className="step completed">
                            <div className="step-circle">3</div>
                            <span className="step-label">预览确认</span>
                        </div>
                        <div className="step-line"></div>
                        <div className="step completed">
                            <div className="step-circle">4</div>
                            <span className="step-label">导出发送</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
