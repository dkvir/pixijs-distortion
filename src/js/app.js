import * as PIXI from 'pixi.js-legacy';
import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';
import PixiPlugin from 'gsap/PixiPlugin';
import { Sprite, Texture } from 'pixi.js';
import fit from 'math-fit';
import t1 from '/images/1.jpeg';
import t2 from '/images/2.jpeg';
import t3 from '/images/3.jpeg';
import t4 from '/images/4.jpeg';
import t5 from '/images/5.jpeg';
import t6 from '/images/6.jpeg';
import t7 from '/images/7.jpeg';
import filterImage from '/images/pixi-filter.jpg';

class Sketch {
  constructor() {
    this.app = new PIXI.Application({
      resolution: window.devicePixelRatio || 1,
      backgroundColor: 0x1099bb,
      // backgroundAlpha: 1,
      resizeTo: window,
      view: document.querySelector('.canvas'),
      antialias: true,
    });

    this.margin = 50;
    this.scroll = 0;
    this.scrollTarget = 0;
    this.width = window.innerWidth * 0.8;
    this.height = (window.innerHeight - 2 * this.margin) / 3;
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);

    this.images = [t1, t2, t3, t4, t5, t6, t7];
    this.wholeHeight = this.images.length * (this.height + this.margin);

    loadImages(this.images, images => {
      this.loadedImages = images;
      this.add();
      this.render();
      this.scrollEvent();
      this.addFilter();
    });
  }

  addFilter() {
    this.displacementSprite = PIXI.Sprite.from(filterImage);

    let filterProp = {
      w: 512,
      h: 512,
    };

    let parent = {
      w: window.innerWidth,
      h: window.innerHeight,
    };

    let cover = fit(filterProp, parent);

    this.displacementSprite.position.set(cover.left, cover.top);
    this.displacementSprite.scale.set(cover.scale, cover.scale);

    this.displacementFilter = new PIXI.filters.DisplacementFilter(
      this.displacementSprite
    );

    this.displacementFilter.scale.y = 0;
    this.displacementFilter.scale.x = 0;

    this.container.filters = [this.displacementFilter];
    this.app.stage.addChild(this.displacementSprite);
  }

  scrollEvent() {
    gsap.registerPlugin(Observer);

    Observer.create({
      type: 'wheel,touch,pointer',
      type: 'wheel,touch',
      tolerance: 20,
      preventDefault: true,
      onChange: self => {
        console.log(self);
        this.scrollTarget = self.deltaY / 3;
      },
    });
  }

  add() {
    let parent = {
      w: this.width,
      h: this.height,
    };

    this.thumbs = [];

    this.loadedImages.forEach((item, index) => {
      let imagesContainer = new PIXI.Container();
      const spritesContainer = new PIXI.Container();
      let texture = Texture.from(item.img);
      let sprite = new Sprite(texture);

      let mask = new Sprite(PIXI.Texture.WHITE);
      mask.width = this.width;
      mask.height = this.height;

      sprite.mask = mask;

      sprite.anchor.set(0.5);
      sprite.position.set(
        sprite.texture.orig.width / 2,
        sprite.texture.orig.height / 2
      );

      let image = {
        w: sprite.texture.orig.width,
        h: sprite.texture.orig.height,
      };

      let cover = fit(image, parent);

      spritesContainer.position.set(cover.left, cover.top);
      spritesContainer.scale.set(cover.scale, cover.scale);

      imagesContainer.x = this.width / 10;
      imagesContainer.y = (this.margin + this.height) * index;

      spritesContainer.addChild(sprite);
      imagesContainer.addChild(spritesContainer);
      imagesContainer.addChild(mask);
      imagesContainer.interactive = true;
      imagesContainer.on('mouseover', this.mouseOn);
      imagesContainer.on('mouseout', this.mouseOut);
      this.container.addChild(imagesContainer);
      this.thumbs.push(imagesContainer);
    });
  }

  calcPos(scroll, posY) {
    let temp =
      ((scroll + posY + this.wholeHeight + this.height + this.margin) %
        this.wholeHeight) -
      this.height -
      this.margin;

    return temp;
  }

  render() {
    this.app.ticker.add(delta => {
      this.app.renderer.render(this.container);
      this.direction = this.scroll > 0 ? -1 : 1;
      this.scroll += (this.scroll - this.scrollTarget) * 0.1;
      this.scroll *= 0.9;

      this.thumbs.forEach(th => {
        th.position.y = this.calcPos(this.scroll, th.position.y);
      });

      this.displacementFilter.scale.y =
        3 * this.direction * Math.abs(this.scroll);
    });
  }

  mouseOn(e) {
    let el = e.target.children[0].children[0];

    gsap.to(el.scale, {
      duration: 1,
      x: 1.1,
      y: 1.1,
    });
  }

  mouseOut(e) {
    let el = e.currentTarget.children[0].children[0];

    gsap.to(el.scale, {
      duration: 1,
      x: 1,
      y: 1,
    });
  }
}

function loadImages(paths, whenLoaded) {
  const imgs = [];
  const img0 = [];
  paths.forEach(function (path) {
    const img = new Image();
    img.onload = function () {
      imgs.push(img);
      img0.push({ path, img });
      if (imgs.length === paths.length) whenLoaded(img0);
    };
    img.src = path;
  });
}

window.onload = () => {
  new Sketch();
};
