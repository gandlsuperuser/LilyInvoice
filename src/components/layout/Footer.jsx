export default function Footer() {
    return (
        <footer className="footer" style={{
            textAlign: 'center',
            padding: '24px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            marginTop: 'auto',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.875rem'
        }}>
            <p>发票生成器 © 2026 | 免费使用 | 无需登录</p>
            <p style={{ marginTop: '8px' }}>
                所有数据仅保存在您的浏览器中，我们不会收集或存储任何信息
            </p>
        </footer>
    );
}
