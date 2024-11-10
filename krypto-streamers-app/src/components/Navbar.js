import React, { Component } from "react";
import logo from "../Images/logo.png";
import "../App.css";

class Navbar extends Component {
	constructor(props) {
		super(props);

		this.state = {
			menuState: false,
			sticky: "",
		};
		this.menuClickHandler = this.menuClickHandler.bind(this);
		this.menuCloseHandler = this.menuCloseHandler.bind(this);
		this.listenToScroll = this.listenToScroll.bind(this);
	}
	componentDidMount() {
		window.addEventListener("scroll", this.listenToScroll);
	}
	listenToScroll() {
		window.scrollY > 0
			? this.setState({ sticky: "sticky" })
			: this.setState({ sticky: "" });
	}
	menuClickHandler() {
		this.setState({
			menuState: true,
		});
	}
	menuCloseHandler() {
		this.setState({
			menuState: false,
		});
	}
	render() {
		const { menuState, sticky } = this.state;
		return (
			<>
				<nav
					className={
						menuState ? `Navbar show ${sticky}` : `Navbar ${sticky}`
					}
				>
					<div className="content">
						<div className="logo">
							<img src={logo} alt="SG" className="logo-icon" />
							<a href="/">Krypto Streamers</a>
						</div>
						<ul className="menu-list" style={{ margin: "0" }}>
							<div
								className="icon cancel-btn"
								onClick={this.menuCloseHandler}
							>
								<i className="fas fa-times"></i>
							</div>
							<li>
								<a onClick={this.menuCloseHandler} href="/">
									Home
								</a>
							</li>
							<li>
								<a
									onClick={this.menuCloseHandler}
									href="#keyFeatures"
								>
									Key Features
								</a>
							</li>
							<li>
								<a
									onClick={this.menuCloseHandler}
									href="#fundRaising"
								>
									Companies
								</a>
							</li>
							<li>
								<a
									onClick={this.menuCloseHandler}
									href="#achievements"
								>
									Leaderboard
								</a>
							</li>
							<li>
								<a onClick={this.menuCloseHandler} href="#faq">
									FAQs
								</a>
							</li>
							<li>
								<a onClick="/quiz">Quiz</a>
							</li>
							<li>
								<a
									onClick={this.menuCloseHandler}
									href="/"
									className="try-for-free tff"
								>
									Login
								</a>
							</li>
						</ul>
						<div
							className={
								menuState
									? "icon menu-btn hide"
									: "icon menu-btn"
							}
							onClick={this.menuClickHandler}
						>
							<i className="fas fa-bars"></i>
						</div>
					</div>
				</nav>
			</>
		);
	}
}

export default Navbar;
