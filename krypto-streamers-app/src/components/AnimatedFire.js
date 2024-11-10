import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { keyframes } from "@emotion/react";
import { styled } from "@mui/material/styles";

// Create animation keyframes
const flameAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

// Create styled component with animation
const AnimatedFireIcon = styled(LocalFireDepartmentIcon)`
	color: #ff4d4d;
	animation: ${flameAnimation} 1.5s ease-in-out infinite;
`;

// Use in your component
function AnimatedFire() {
	return <AnimatedFireIcon fontSize="large" sx={{ paddingTop: 8 }} />;
}

export default AnimatedFire;
