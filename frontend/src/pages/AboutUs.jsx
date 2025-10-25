import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/AboutUs.css';
import HeaderWrapper from '../components/Header/HeaderWrapper'
import Footer from '../components/Footer/Footer';
export default function AboutUs() {

    return (
        
        <div>

            <section>
                <div className="container">
                    <img className='img_first' src="https://bizweb.dktcdn.net/100/369/010/files/dc-about-us.jpg?v=1741677112951" alt=""  />
                    <img src="https://bizweb.dktcdn.net/100/369/010/files/qua-trinh.jpg?v=1741677143087" alt="" />
                    <img src="https://bizweb.dktcdn.net/100/369/010/files/dirtycoins-flagship-store-dico-the-hood-vie-151f89e2-ece4-499d-ab63-09556f3a7e2a.jpg?v=1759737072330" alt="" />
                    <img src="https://bizweb.dktcdn.net/100/369/010/files/he-thong-cua-hang-about-us-1-fe8d14c1-8443-4aa5-beef-44c9fdc68e31.jpg?v=1759735632893" alt="" />
                    <img src="https://bizweb.dktcdn.net/100/369/010/files/artboard-5-5a646fb4-2933-4483-a174-a76c54c6c37d.jpg?v=1722509083130" alt="" />
                    <img src="https://bizweb.dktcdn.net/100/369/010/files/artboard-3-ad8ceb62-b4c0-4135-9fed-3b720456f592.jpg?v=1722481569908" alt="" />
                </div>
            </section>
            <Footer />
        </div>
    );
}
