import React from "react";
import logo from "../Images/logo.png";

const SubSection = (props) => {
	return (
		<div className="footer-section" data-aos="fade-up">
			<h4>{props.item.title}</h4>
			<div className="sub-section">
				{props.item.content.map((it, index) => {
					return (
						<p key={index}>
							<a href="/">{it}</a>
						</p>
					);
				})}
			</div>
		</div>
	);
};
const Credits = () => {
	return (
		<section className="credits" data-aos="fade-up">
			<div className="content">
				<h5>
					Developed By{" "}
					<a rel="noreferrer">
						Sakshi Parikh, Dhruv Desai, Sunny Yadav
					</a>{" "}
					| <i className="fal fa-copyright"></i> 2024 All rights
					reserved.
				</h5>
			</div>
		</section>
	);
};
function Footer() {
	const Section = [
		{
			id: "1",
			title: "About us",
			content: [
				"Support Center",
				"Customer Center",
				"About us",
				"Copyright",
				"Popular Campaign",
			],
		},
		{
			id: "2",
			title: "Our Information",
			content: [
				"Return Policy",
				"Privacy Policy",
				"Terms & Conditions",
				"Site Map",
				"Store Hours",
			],
		},
		{
			id: "3",
			title: "My Account",
			content: [
				"Press inquiries",
				"Social media directories",
				"Images & B-roll",
				"Permissions",
				"Speaker requests",
			],
		},
		{
			id: "4",
			title: "Policy",
			content: [
				"Application security",
				"Software principles",
				"Unwanted software",
				"policy",
				"Responsible supply",
			],
		},
	];
	return (
		<>
			<Credits />
		</>
	);
}

export default Footer;
