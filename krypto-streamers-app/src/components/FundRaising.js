import React from "react";
import fundGraph from "../Images/circular-graph.png";
import fundRaising from "../Images/fundraising.png";

function FundRaising() {
	return (
		<>
			<section className="fund-raising" id="fundRaising">
				<div className="content">
					<div className="fund-content">
						<div className="fund-graph" data-aos="fade-up">
							<img src={fundGraph} alt="Graph" />
						</div>
						<div className="fund-text-content" data-aos="fade-up">
							<div className="fund-text">
								<h1> Companies associated and funds raised</h1>
								<img
									src={fundRaising}
									alt="Companies and Funding"
								/>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}

export default FundRaising;
