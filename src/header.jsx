import './Header.css'

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="/" className="brand">OFFBEATZ</a>

        <nav className="nav">
          <a href="#shop">Shop</a>
          <a href="#drop">Drop</a>
          <a href="#story">Story</a>
          <a href="#contact">Contact</a>
        </nav>

        <a href="#" className="bag">Bag</a>
      </div>
    </header>
  )
}