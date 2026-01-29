import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
    return (
        <>
            <Header />
            <main className="main-content">
                <div className="app-container">
                    {children}
                </div>
            </main>
            <Footer />
        </>
    );
}
