import React from "react";
import { Link } from "react-router-dom";

function Footer() {
    return (
        <div className="container">
            <footer className="py-5">
                <div className="row">
                    <div className="col-6 col-md-2 mb-3">
                        <h5>Section</h5>
                        <ul className="nav flex-column">
                            <li className="nav-item mb-2">
                                <Link to="/" className="nav-link p-0 text-body-secondary">Home</Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/" className="nav-link p-0 text-body-secondary">Features</Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/" className="nav-link p-0 text-body-secondary">Pricing</Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/" className="nav-link p-0 text-body-secondary">FAQs</Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/about" className="nav-link p-0 text-body-secondary">About</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="col-6 col-md-2 mb-3">
                        <h5>Section</h5>
                        <ul className="nav flex-column">
                            <li className="nav-item mb-2">
                                <Link to="/" className="nav-link p-0 text-body-secondary">Home</Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/" className="nav-link p-0 text-body-secondary">Features</Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/" className="nav-link p-0 text-body-secondary">Pricing</Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/" className="nav-link p-0 text-body-secondary">FAQs</Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/about" className="nav-link p-0 text-body-secondary">About</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="col-6 col-md-2 mb-3">
                        <h5>Section</h5>
                        <ul className="nav flex-column">
                            <li className="nav-item mb-2">
                                <Link to="/" className="nav-link p-0 text-body-secondary">Home</Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/" className="nav-link p-0 text-body-secondary">Features</Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/" className="nav-link p-0 text-body-secondary">Pricing</Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/" className="nav-link p-0 text-body-secondary">FAQs</Link>
                            </li>
                            <li className="nav-item mb-2">
                                <Link to="/about" className="nav-link p-0 text-body-secondary">About</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="col-md-5 offset-md-1 mb-3">
                        <form>
                            <h5>Subscribe to our newsletter</h5>
                            <p>Monthly digest of what's new and exciting from us.</p>
                            <div className="d-flex flex-column flex-sm-row w-100 gap-2">
                                <label className="visually-hidden" htmlFor="newsletter1">Email address</label>
                                <input id="newsletter1" type="text" className="form-control" placeholder="Email address" />
                                <button className="btn btn-primary" type="button">Subscribe</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="d-flex flex-column flex-sm-row justify-content-between py-4 my-4 border-top">
                    <p>&copy; 2023 Company, Inc. All rights reserved.</p>
                    <ul className="list-unstyled d-flex">
                        <li className="ms-3">
                            <a className="link-body-emphasis" href="https://twitter.com" target="_blank" rel="noreferrer">
                                <i className="fas fa-twitter"></i>
                            </a>
                        </li>
                        <li className="ms-3">
                            <a className="link-body-emphasis" href="https://instagram.com" target="_blank" rel="noreferrer">
                                <i className="fas fa-instagram"></i>
                            </a>
                        </li>
                        <li className="ms-3">
                            <a className="link-body-emphasis" href="https://facebook.com" target="_blank" rel="noreferrer">
                                <i className="fas fa-facebook"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </footer>
        </div>
    );
}

export default Footer;