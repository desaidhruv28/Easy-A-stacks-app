import React from "react";
import award from "../Images/awards.png";
import community from "../Images/community.png";
import mcustomers from "../Images/customers.png";
import transactions from "../Images/transactions.png";

function Achievement() {
	const Card = (props) => {
		return (
			<div className="card" data-aos="fade-up">
				<img src={props.image} alt={props.name} />
				<h1>{props.count}</h1>
				<h3>{props.name}</h3>
			</div>
		);
	};
	return (
		<>
			<section className="achievement" id="achievements">
				<div className="content">
					<div className="achievement-content">
						<div className="all-cards">
							<div className="card-section-1">
								<Card
									name="Quizzes"
									count="500+"
									image={award}
								/>
								<Card
									name="Community"
									count="3500+"
									image={community}
								/>
							</div>
							<div className="card-section-2">
								<Card
									name="Funding Received by companies"
									count="80000$"
									image={mcustomers}
								/>
								<Card
									name="Money received"
									count="30000+"
									image={transactions}
								/>
							</div>
						</div>
						<div
							className="achivement-text-section"
							data-aos="fade-up"
						>
							<div className="text-content">
								<h1>Our Achievements</h1>
								<p>
									Our innovative model rewards learners with
									cryptocurrency for engaging with educational
									videos and completing quizzes, allowing them
									to earn while they learn. Backed by funding
									from multiple companies, we empower users to
									enhance their skills and grow in the
									exciting world of crypto.
								</p>
								<a href="/">
									See Our Stories{" "}
									<i className="fal fa-long-arrow-right"></i>
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}

export default Achievement;
