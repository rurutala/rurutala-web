import { socialLinks } from '../../constants/site'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <p>rurutala.net</p>
          <span>るるたぁ Official Site</span>
        </div>

        <div className="site-footer__social">
          <nav className="social-links" aria-label="SNSリンク">
            {socialLinks.map((link) => (
              <a href={link.href} key={link.label} aria-label={link.label} target="_blank" rel="noreferrer">
                <img src={link.icon} alt="" aria-hidden="true" />
              </a>
            ))}
          </nav>
          <p>© rurutala All rights reserved</p>
        </div>
      </div>
    </footer>
  )
}
