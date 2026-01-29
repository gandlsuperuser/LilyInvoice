import { Link, useLocation } from 'react-router-dom';

export default function Header() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <header className="header">
            <div className="header-content">
                <Link to="/" className="logo">
                    <span className="logo-icon">📄</span>
                    <span>发票生成器</span>
                </Link>

                <nav className="nav-links">
                    <Link
                        to="/"
                        className={`nav-link ${isActive('/') ? 'active' : ''}`}
                    >
                        首页
                    </Link>
                    <Link
                        to="/create"
                        className={`nav-link ${isActive('/create') ? 'active' : ''}`}
                    >
                        手动创建
                    </Link>
                    <Link
                        to="/scan"
                        className={`nav-link ${isActive('/scan') ? 'active' : ''}`}
                    >
                        扫描发票
                    </Link>
                </nav>
            </div>
        </header>
    );
}
