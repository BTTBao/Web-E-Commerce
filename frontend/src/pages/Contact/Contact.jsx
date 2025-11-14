import {useState} from 'react'
import './Contact.css';

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const MapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z"></path>
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" stroke="white"></line>
  </svg>
);


function Contact() {
    const [formSend, setFormSend] = useState({
        Name : '',
        Email : '',
        Message: ''
    });
    const [loading, setLoading] = useState(false);

    const SendEmail = async (e) => {
        e.preventDefault();

        if (loading) return alert('Đang load dữ liệu !!');

        if (formSend.Name === '' || formSend.Email === '' || formSend.Message === '')
            return alert('Không được để trống');

        try {
            setLoading(true);
            const res = await fetch('https://localhost:7132/api/Email', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formSend)
            });

            if (res.ok) {
                alert('Gửi mail thành công <3');
            } else {
                alert('Gửi thất bại');
            }
        } catch (err) {
            console.log(err);
            alert('Có lỗi xảy ra');
        } finally {
            setLoading(false); // tắt loading sau khi fetch xong
        }
    }

  return (
    <div className="contact-page-wrapper">
      <div className="contact-container">
        
        <div className="contact-header">
          <h1>Get In Touch</h1>
          <p>We are here for you! How can we help?</p>
        </div>

        {/* === Phần Thân (Layout 2 cột) === */}
        <div className="contact-body">

          {/* Cột trái: Thông tin liên hệ */}
          <div className="contact-info">
            <h3>Contact Information</h3>
            <p>Fill up the form and our team will get back to you within 24 hours.</p>
            
            <div className="info-item">
              <PhoneIcon />
              <span>+01 234 567 890</span>
            </div>
            <div className="info-item">
              <EmailIcon />
              <span>support@fashion.com</span>
            </div>
            <div className="info-item">
              <MapIcon />
              <span>123 Fashion St, Paris, France</span>
            </div>

            <div className="social-links">
              <a href="#" aria-label="Facebook"><FacebookIcon /></a>
              <a href="#" aria-label="Twitter"><TwitterIcon /></a>
              <a href="#" aria-label="Instagram"><InstagramIcon /></a>
            </div>
          </div>

          {/* Cột phải: Form liên hệ */}
          <div className="contact-form">
            <form>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" placeholder="Your Name" required onChange={(e) =>{setFormSend(prev=>({...prev,Name: e.target.value}))}}/>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" placeholder="Your Email" required onChange={(e) =>{setFormSend(prev=>({...prev,Email: e.target.value}))}}/>
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows="5" placeholder="Your Message..." required onChange={(e) =>{setFormSend(prev=>({...prev,Message: e.target.value}))}}></textarea>
              </div>
              <button type="submit" className="submit-btn" onClick={e => SendEmail(e)}>Send Message</button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Contact;