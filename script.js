const paper = document.querySelector("#paper");
const pen = paper.getContext("2d");

const soundToggleButton = document.getElementById("sound-toggle");
let soundEnabled = false;
document.onvisibilitychange = () => soundEnabled = false;

let startTime = new Date().getTime(); // --> to keep track on when the page loads (Time)

const colors = [
  "#ffff00",
  "#e0fb22",
  "#c2f536",
  "#a5ee47",
  "#88e755",
  "#6bdf62",
  "#4cd76d",
  "#23ce77",
  "#00c480",
  "#00ba87",
  "#00b08c",
  "#00a690",
  "#009b91",
  "#009190",
  "#00868d",
  "#007b89",
  "#007182",
  "#00667a",
  "#105c70",
  "#225264",
  "#2a4858"
]

// --> handles sound on/off
soundToggleButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  if(soundEnabled) {
    soundToggleButton.style.position = "fixed";
    soundToggleButton.style.left = "20px";
    soundToggleButton.innerHTML = '<img src="images/volume.png" alt="Sound On" style="height: 1.7rem; width: 1.7rem;">';
  } else {
    soundToggleButton.style.position = "fixed";
    soundToggleButton.style.left = "20px";
    soundToggleButton.innerHTML = '<img src="images/mute.png" alt="Sound Off" style="height: 1.7rem; width: 1.7rem;">';
  }
})

// --> audio initializing
const calculateNextImpactTime = (currentImpactTime, velocity) => {
  return currentImpactTime + (Math.PI / velocity) * 1000;
}

// --> arc properties
const calculateArcProperties = (index, startTime) => {
  const oneFullLoop = 2 * Math.PI;
  const maxCycles = 50;
  const numberOfLoops = maxCycles - index;
  const duration = 900;
  const velocity = (oneFullLoop * numberOfLoops) / duration;
  const nextImpactTime = calculateNextImpactTime(startTime, velocity); // --> for the sound on impact

  return {
    velocity,
    nextImpactTime
  };
};

arcs = colors.map((color, index) => {
  const audio = new Audio(`audio-keys/key-${index}.mp3`);
  audio.volume = 0.06;

  const { velocity, nextImpactTime } = calculateArcProperties(index, startTime);

  return {
    color,
    audio,
    nextImpactTime,
    velocity
  }
});

// --> Values for the drawing
const draw = () => {
  paper.width = paper.clientWidth;
  paper.height = paper.clientHeight;

  // --> position of BaseLine on canvas x:y axis
  const start = {
    x: paper.width * 0.1,
    y: paper.height * 0.9
  }

  const end = {
    x: paper.width * 0.9,
    y: paper.height * 0.9
  }

  const center = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2
  }

  const length = end.x - start.x;

  const oneFullLoop = 2 * Math.PI;

  // --> to get access to how much time has passed
  const currentTime = new Date().getTime();
  const elapsedTime = (currentTime - startTime) / 1000;

  // --> color and thickness of pen
  pen.strokeStyle = "white";
  pen.lineWidth = 5;

  // --> Draw BaseLine
  pen.beginPath(); // --> initialize drawing
  pen.moveTo(start.x, start.y); // --> initialize beginning and end of drawing
  pen.lineTo(end.x, end.y);
  pen.stroke(); // --> creates drawing

  const initialArcRadius = length * 0.05;
  const spacing = (length / 2 - initialArcRadius) / arcs.length;


  arcs.forEach((arc, index) => {
    const arcRadius = initialArcRadius + (index * spacing);

    const { velocity, nextImpactTime } = calculateArcProperties(index, startTime);

    const distance = Math.PI + (elapsedTime * velocity);
    const modDistance = distance % oneFullLoop;
    const adjustedDistance = modDistance >= Math.PI ? modDistance : oneFullLoop - modDistance;

    // --> Draw Arc
    pen.beginPath();
    pen.strokeStyle = arc.color;
    pen.arc(center.x, center.y, arcRadius, Math.PI, Math.PI * 2);
    pen.stroke();

    // --> formula to find the coordinates of point on circle
    const x = center.x + arcRadius * Math.cos(adjustedDistance);
    const y = center.y + arcRadius * Math.sin(adjustedDistance);

    // --> Draw Circle
    pen.beginPath();
    pen.arc(x, y, length * 0.0065, 0, Math.PI * 2);
    pen.fillStyle = "white";
    pen.fill();


    // --> audio play
    if(currentTime >= arc.nextImpactTime) {
      if(soundEnabled) {
        arc.audio.play();
      }
      arc.nextImpactTime = calculateNextImpactTime(arc.nextImpactTime, arc.velocity);
    }
  })
  requestAnimationFrame(draw);
}

draw();
