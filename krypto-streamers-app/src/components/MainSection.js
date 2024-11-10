import React from "react";
import mainBg from "../Images/banner-bg.png";

function Mainsection() {
	return (
		<section className="main-section content" id="mainSection">
			<div className="main-text" data-aos="fade-up">
				<div className="heading">
					<h1>
						Welcome next level cryptocurrency token with faster
						transfer
					</h1>
					<p>
						Our platform rewards learning with cryptocurrency,
						empowering knowledge growth, skill enhancement, within a
						vibrant, supportive community. Join us!
					</p>
				</div>
			</div>
			<div className="main-image" data-aos="fade-up">
				<img src={mainBg} alt="BG" />
			</div>
		</section>
	);
}

export default Mainsection;
