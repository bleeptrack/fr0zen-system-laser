let flakesize = 600;

let gridsize = 1;

let open = false;
let s1;
let moveVec;
let btn;

paper.install(window);
window.onload = function () {
  paper.setup("paperCanvas");

  let startsize = Math.min(view.bounds.width, view.bounds.height) * 0.3;
  let endsize = gridsize * flakesize;
  let zoomlevel = (startsize * 1.5) / endsize; //0.3;

  view.zoom = zoomlevel;
  view.center = new Point(endsize / 2, endsize / 2);
  btn = document.getElementById("generate");

  let canvas = document.getElementById("paperCanvas");

  if (view.bounds.width > view.bounds.height) {
    moveVec = [view.bounds.width / 10, 0];
  } else {
    moveVec = [0, view.bounds.height / 10];
  }

  generate();

  view.onMouseDown = function (event) {
    if (!open) {
      s1.whitepaper.tweenTo(
        { position: s1.whitepaper.position.subtract(moveVec) },
        { easing: "easeInOutQuint", duration: 200 }
      );

      s1.bluePaper.tweenTo(
        { position: s1.bluePaper.position.add(moveVec) },
        { easing: "easeInOutQuint", duration: 200 }
      );
      s1.engravings.tweenTo(
        { position: s1.engravings.position.add(moveVec) },
        { easing: "easeInOutQuint", duration: 200 }
      );
      open = true;
    } else {
      s1.whitepaper.tweenTo(
        { position: view.bounds.center },
        { easing: "easeInOutQuint", duration: 200 }
      );

      s1.bluePaper.tweenTo(
        { position: view.bounds.center },
        { easing: "easeInOutQuint", duration: 200 }
      );
      s1.engravings.tweenTo(
        { position: view.bounds.center },
        { easing: "easeInOutQuint", duration: 200 }
      );
      open = false;
    }
    s1.whitepaper.position = event.point;
    console.log(event);
  };
};

function generate() {
  project.activeLayer.removeChildren();

  (async function () {
    s1 = new Snowflake(view.bounds.center, false, 5);
    //s1.animationFlow(10);
    s1.addBorder();
    s1.solidifyLine();
    //s1.colorForLaser();
  })();
}

function downloadSVGLaser() {
  s1.whitepaper.position = view.bounds.center;
  s1.bluePaper.position = view.bounds.center;
  s1.engravings.position = view.bounds.center;
  s1.toggleColor();
  var svg = project.exportSVG({ asString: true, bounds: "content" });
  var svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  var svgUrl = URL.createObjectURL(svgBlob);
  var downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = "snowflake.svg";
  s1.toggleColor();
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
