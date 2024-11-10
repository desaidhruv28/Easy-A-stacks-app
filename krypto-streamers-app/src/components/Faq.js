import React from "react";
import Accordian from "./Accordian";

function Faq() {
	const Questions = [
		{
			question: "1: How does the earning system work?",
			answer: "Users earn cryptocurrency by watching educational videos and completing quizzes. The more you engage and perform well, the higher your ranking, which translates to greater rewards.",
		},
		{
			question: "2: What types of videos and quizzes will be available?",
			answer: "We offer a variety of videos and quizzes covering essential topics in cryptocurrency, blockchain technology, and financial literacy, designed to enhance your knowledge and skills in the crypto space.",
		},
		{
			question: "3: Who has funded this initiative?",
			answer: "Our initiative has received funding from multiple reputable companies in the tech and finance sectors, which helps us provide valuable resources and support to our users as they grow in their crypto journey.",
		},
		{
			question:
				"4: Is there a limit to how much cryptocurrency I can earn?",
			answer: "While there is no fixed limit to your earnings, your rewards depend on your engagement level, quiz performance, and overall ranking. The more actively you participate, the more you can earn!",
		},
	];
	return (
		<section className="Faq" id="faq">
			<div className="content">
				<div className="faq-heading" data-aos="fade-up">
					<h1>Have Any Question ?</h1>
					<p>Happy to Help!</p>
				</div>
				<Accordian
					question={Questions[0].question}
					answer={Questions[0].answer}
					id="One"
				/>
				<Accordian
					question={Questions[1].question}
					answer={Questions[1].answer}
					id="Two"
				/>
				<Accordian
					question={Questions[2].question}
					answer={Questions[2].answer}
					id="Three"
				/>
				<Accordian
					question={Questions[3].question}
					answer={Questions[3].answer}
					id="Four"
				/>
			</div>
		</section>
	);
}

export default Faq;
