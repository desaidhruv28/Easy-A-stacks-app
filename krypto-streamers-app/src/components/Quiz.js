import React, { useState } from "react";
import { Carousel } from "react-responsive-carousel";
import Figure from "react-bootstrap/Figure";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "../styles.css";

function Quiz() {
	const [showQuiz, setShowQuiz] = useState(false);
	const videoId = "UJzNCWlNmSM";

	const quizVideos = [
		{
			id: "quiz1",
			title: "Stacks (STX) Staking Guide",
			youtubeId: videoId,
			stats: {
				totalParticipants: 1500,
				leaderboard: [
					{ position: "1st", name: "Sakshi", score: 5 },
					{ position: "2nd", name: "Sunny", score: 4 },
					{ position: "3rd", name: "Dhruv", score: 3 },
				],
			},
		},
	];

	const handleStartQuiz = () => {
		setShowQuiz(true);
	};

	return (
		<div className="quiz-carousel">
			<h2>Crypto Quizzes</h2>
			<Carousel
				showArrows={true}
				showStatus={false}
				showIndicators={true}
				infiniteLoop={true}
				showThumbs={false}
				useKeyboardArrows={true}
				autoPlay={false}
				stopOnHover={true}
				swipeable={true}
				dynamicHeight={false}
				emulateTouch={true}
				thumbWidth={60}
			>
				{quizVideos.map((video) => (
					<div key={video.id} className="quiz-slide">
						<h3>{video.title}</h3>
						<div className="video-container">
							<iframe
								width="560"
								height="315"
								src={`https://www.youtube.com/embed/${video.youtubeId}`}
								title={video.title}
								frameBorder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							></iframe>
						</div>
						<div className="leaderboard-stats">
							<h3>Quiz Statistics</h3>
							<p>
								Total Participants:{" "}
								{video.stats.totalParticipants}
							</p>
							<h4>Leaderboard</h4>
							<ResponsiveContainer width="100%" height={300}>
								<BarChart
									data={video.stats.leaderboard}
									margin={{
										top: 5,
										right: 30,
										left: 20,
										bottom: 5,
									}}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="name" />
									<YAxis />
									<Tooltip />
									<Legend />
									<Bar dataKey="score" fill="#8884d8" />
								</BarChart>
							</ResponsiveContainer>
							<ul>
								{video.stats.leaderboard.map(
									(leader, index) => (
										<li key={index}>
											{leader.position}: {leader.name} -
											Score: {leader.score}
										</li>
									)
								)}
							</ul>
						</div>
						<button
							className="start-quiz-btn"
							onClick={handleStartQuiz}
						>
							Start Quiz
						</button>
					</div>
				))}
			</Carousel>
			{showQuiz && (
				<div className="quiz-container">
					<h3>Quiz Questions</h3>
					{/* Add your quiz questions and logic here */}
					<p>Quiz content goes here...</p>
				</div>
			)}
		</div>
	);
}

export default Quiz;
