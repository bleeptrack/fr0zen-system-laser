class Snowflake {
  constructor(point, anim, f) {
    this.animation = anim;
    this.angle = 60;
    this.pos = point;

    this.innerLines = [];
    this.outerLines = [];
    this.hexagons = [];
    this.tween;

    this.buildUp(point, f);
  }

  copyColorToNewGroup(col, col2) {
    let paths = getLayerByStrokeColor(col);
    let newPaths = [];
    paths.forEach((item) => {
      let newPath = item.clone();
      newPath.strokeColor = col2;
      newPaths.push(newPath);
    });
    return newPaths;
  }

  getLayerByStrokeColor(col) {
    return this.lineGroup.children.filter(
      (item) => item.strokeColor != null && item.strokeColor.equals(col)
    );
  }

  getLayerByFillColor(col) {
    return this.lineGroup.children.filter(
      (item) => item.fillColor != null && item.fillColor.equals(col)
    );
  }

  getItemsByName(name) {
    return project.getItems({
      name: name,
    });
  }

  async buildUp(point, f) {
    this.lineGroup = new Group();
    this.mainLine = new Path.Line(point, point.subtract([0, 300]));
    this.mainLine.strokeColor = "white";
    this.mainLine.strokeWidth = 15;
    this.mainLine.strokeCap = "round";

    if (this.animation) {
      this.mainLine.dashArray = [this.mainLine.length, this.mainLine.length];
      await this.mainLine.tweenFrom(
        { dashOffset: this.mainLine.length },
        500 * f
      );
      this.mainLine.tweenTo({ strokeColor: "grey" }, 200 * f);
    }

    let newlines = this.decorateLine(this.mainLine, 0);

    let fliplines = this.flip();

    let decolines = this.decorateBackground(this.mainLine);

    this.lineGroup.addChild(this.mainLine);

    let spreadGroups = this.spread();

    let decolines2 = this.decorateBackground();

    let outline1 = this.createOutLine(20);

    this.mainStrokes2 = this.getLayerByStrokeColor(new Color("red"));
    this.mainStrokes = this.getLayerByStrokeColor(new Color("white"));

    //sideStrokesCut = copyColorToNewGroup('red', 'white');
    this.hexas = this.getLayerByStrokeColor(new Color("DarkSlateBlue"));
    this.cutline = this.getLayerByStrokeColor(new Color("green"))[0];
    this.holes = this.getLayerByFillColor(new Color("purple"));
  }

  createOutLine(dist) {
    let shape = new Path();
    this.lineGroup.children.forEach((path) => {
      if (path.closed) {
        let p = PaperOffset.offset(path, dist + path.strokeWidth / 2);

        let tmp = p.unite(shape);
        shape.remove();
        p.remove();
        shape = tmp;
      } else {
        let p = PaperOffset.offsetStroke(path, dist + path.strokeWidth / 2);
        p.fillColor = "orange";
        let tmp = p.unite(shape);
        shape.remove();
        p.remove();
        shape = tmp;

        let c = new Path.Circle(
          path.lastSegment.point,
          dist + path.strokeWidth / 2
        );
        c.fillColor = "black";
        let tmp2 = c.unite(shape);
        shape.remove();
        c.remove();
        shape = tmp2;
      }
    });
    //let p = PaperOffset.offset(shape, 20);
    //shape.remove();
    //shape = p;
    if (!this.animation) {
      shape.strokeColor = "green";
    }
    shape.fillColor = undefined;
    return shape;
  }

  spread() {
    let newGroup = new Group();
    let groupSize;
    for (let i = 1; i < 6; i++) {
      //6
      let sym = this.lineGroup.clone();
      groupSize = sym.children.length;
      sym.rotate(this.angle * i, this.pos);
      newGroup.addChildren(sym.children);
    }

    newGroup.addChildren(this.lineGroup.children);
    this.lineGroup = newGroup;

    let spreadGroups = [];
    for (let i = 0; i < 5; i++) {
      spreadGroups.push(
        this.lineGroup.children.slice(groupSize * i, groupSize * (i + 1))
      );
    }
    return spreadGroups;
  }

  flip() {
    let flip = this.lineGroup.clone();
    flip.scale(-1, 1, this.lineGroup.bounds.bottomLeft);
    let newGroup = new Group();
    newGroup.addChildren(this.lineGroup.children);
    let lngth = newGroup.children.length;
    newGroup.addChildren(flip.children);
    this.lineGroup = newGroup;
    return this.lineGroup.children.slice(lngth);
  }

  decorateBackground(line) {
    let hexa;
    if (line) {
      hexa = new Path.RegularPolygon(
        line.getPointAt((Math.random() * line.length) / 2 + line.length / 2),
        6,
        Math.max(line.length / 5, (Math.random() * line.length) / 2)
      );
      hexa.strokeWidth = line.strokeWidth;
    } else {
      hexa = new Path.RegularPolygon(this.pos, 6, Math.random() * 100 + 100);
      hexa.strokeWidth = this.mainLine.strokeWidth;
    }
    hexa.strokeColor = "DarkSlateBlue";
    hexa.sendToBack();
    this.lineGroup.addChild(hexa);
    for (let i = 1; i < 4; i++) {
      let smallHexa = hexa.clone();
      smallHexa.scale(1 - i * 0.2);

      if (i == 3) {
        smallHexa.strokeWidth = 1;
        smallHexa.fillColor = "purple";
        smallHexa.strokeColor = "purple";
        smallHexa.sendToBack();
      } else {
        smallHexa.strokeWidth = hexa.strokeWidth * (1 - i * 0.3);
        smallHexa.sendToBack();
      }
      this.lineGroup.addChild(smallHexa);
    }
    return this.lineGroup.children.slice(-4);
  }

  decorateLine(line, depth) {
    let lines = [];
    for (let i = 0; i < Math.floor(Math.random() * 4 + 2); i++) {
      let miniLine = line.clone();
      miniLine.scale(1 / (Math.random() * 5 + 1));
      miniLine.strokeWidth = (line.strokeWidth * 3) / 4;

      let start = line.getPointAt(
        Math.max(miniLine.length, Math.random() * line.length)
      );
      miniLine.position = start;
      miniLine.rotate(60, miniLine.firstSegment.point);
      miniLine.bringToFront();
      this.lineGroup.addChild(miniLine);
      lines.push(miniLine);
      if (depth < 1) {
        miniLine.strokeColor = "red";
      } else {
        miniLine.strokeColor = "DarkSlateBlue";
      }

      let conti =
        Math.random() < 0.7 && miniLine.length > this.mainLine.length / 3;
      if (conti) {
        lines = lines.concat(this.decorateLine(miniLine, depth + 1));
      }
    }
    return lines;
  }

  addBorder() {
    let cutline = this.getLayerByStrokeColor(new Color("green"))[0];
    cutline.remove();

    let outlineOut = this.createOutLine(70);
    cutline = cutline.insertAbove(outlineOut);

    let c1 = new Path.Circle(outlineOut.firstSegment.point.add([0, 35]), 15);

    this.outline = new Group(outlineOut, c1);
    this.outline.strokeColor = "pink";
  }

  solidifyLine() {
    let cutline = this.getLayerByStrokeColor(new Color("green"))[0];

    let lines = [];
    let arr = this.getLayerByStrokeColor(new Color("white"));
    arr.forEach((item) => {
      item.scale(2, this.pos);
      let newLine = PaperOffset.offsetStroke(item, item.strokeWidth, {
        cap: "round",
      });
      newLine.fillColor = "yellow";
      lines.push(newLine);
      item.remove();
    });

    arr = this.getLayerByStrokeColor(new Color("red"));
    arr.forEach((item) => {
      let newLine = PaperOffset.offsetStroke(item, item.strokeWidth, {
        cap: "round",
      });
      //newLine.strokeColor = 'red';
      newLine.fillColor = "yellow";
      lines.push(newLine);
      let r1 = new Path.Circle(
        item.firstSegment.point,
        item.strokeWidth + 0.01
      );
      lines.push(r1);
      let r2 = new Path.Circle(item.lastSegment.point, item.strokeWidth + 0.01);
      lines.push(r2);
      item.remove();
    });

    let finalItem = new Path();
    lines.forEach((item) => {
      let tmp = item.unite(finalItem);
      item.remove();
      finalItem.remove();
      finalItem = tmp;
    });
    finalItem.fillColor = "orange";

    let tmpcut = cutline.subtract(finalItem);
    finalItem.remove();
    cutline.remove();
    //this.cutline = tmpcut
    this.cutline = tmpcut;

    this.bluePaper = new CompoundPath();
    this.bluePaper.fillRule = "evenodd";
    this.bluePaper.addChild(this.outline.children[0].clone());
    this.bluePaper.addChild(this.outline.children[1].clone());
    this.holes.forEach((hole) => this.bluePaper.addChild(hole));
    this.bluePaper.fillColor = "CornflowerBlue";
    this.bluePaper.shadowColor = new Color(0, 0, 0);
    this.bluePaper.shadowBlur = 4;
    this.bluePaper.shadowOffset = new Point(2, 2);
    this.bluePaper.sendToBack();

    this.engravings = new Group(this.hexas);

    this.whitepaper = new CompoundPath();
    this.whitepaper.fillRule = "evenodd";
    this.whitepaper.addChildren(this.outline.children);
    this.whitepaper.addChild(this.cutline);
    this.whitepaper.fillColor = "white";
    this.whitepaper.shadowColor = new Color(0, 0, 0);
    this.whitepaper.shadowBlur = 4;
    this.whitepaper.shadowOffset = new Point(2, 2);
  }

  clamp(value, min, max) {
    if (value < min) {
      return min;
    } else if (value > max) {
      return max;
    }
    return value;
  }

  //min and max are included
  randInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  toggleColor() {
    if (this.whitepaper.fillColor) {
      this.whitepaper.strokeColor = this.whitepaper.fillColor;
      this.whitepaper.fillColor = null;
      this.bluePaper.strokeColor = this.bluePaper.fillColor;
      this.bluePaper.fillColor = null;

      this.whitepaper.shadowColor = null;
      this.whitepaper.shadowBlur = 0;
      this.whitepaper.shadowOffset = 0;
      this.bluePaper.shadowColor = null;
      this.bluePaper.shadowBlur = 0;
      this.bluePaper.shadowOffset = 0;
    } else {
      this.whitepaper.fillColor = this.whitepaper.strokeColor;
      this.whitepaper.strokeColor = null;
      this.bluePaper.fillColor = this.bluePaper.strokeColor;
      this.bluePaper.strokeColor = null;

      this.whitepaper.shadowColor = new Color(0, 0, 0);
      this.whitepaper.shadowBlur = 4;
      this.whitepaper.shadowOffset = new Point(2, 2);
      this.bluePaper.shadowColor = new Color(0, 0, 0);
      this.bluePaper.shadowBlur = 4;
      this.bluePaper.shadowOffset = new Point(2, 2);
    }
  }
}
