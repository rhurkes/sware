import * as React from 'react';
import swareConfig from '../../config/swareConfig';


/* TODOs
Everything breaks when you start interacting and images aren't loaded
add a few more regions
not updating on switching region/band
not auto-updating
redo all this when resizing page
updates do something funky - geolocation update is a good example. you have an old "current" and the current one
*/

interface IGOES16ComponentProps {
  // TODO finish this when props are locked down
}

const animationDelayMs = 300;
const doubleTouchWindowMs = 500;
const configPathname = '/goes16/config';

const Direction = {
  Previous: 'prev' as 'prev',
  Next: 'next' as 'next',
};

class GOES16Component extends React.Component<any, {}> {
  constructor(props) {
    super(props);
    
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
  }
  
  eventsTimer;
  goesContainerElement;
  currentImageIndex = 0;
  animateTimer;
  animating;
  lastTouchStart = 0;
  lastTouchX = 0;
  images;
  indicators;
  scrollUnit;

  componentDidMount() {
    const { fetching, fetchImageData, fetchingTimer, userConfig } = this.props;
    document.addEventListener('keydown', this.handleKeydown);

    // fetchingTimer check is important to prevent this from firing every time you change routes
    if (fetching && !fetchingTimer) {
      fetchImageData(userConfig.region.value, userConfig.band.value);
    }
  }

  toggleAnimateImages(stop?: boolean): void {
    clearInterval(this.animateTimer);
    if (this.animating || stop) {
      this.animating = false;
      return;
    }

    this.animating = true;

    this.animateTimer = setInterval(() => {
      this.moveThoughImages(Direction.Next, true);
    }, animationDelayMs);
  }

  moveThoughImages(direction: string, animation: boolean, stopAtEnd?: boolean): void {
    this.goesContainerElement = this.goesContainerElement || document.getElementById('goes-container');
    this.images = this.images || this.goesContainerElement.querySelectorAll('img');
    this.indicators = this.indicators || this.goesContainerElement.querySelectorAll('.indicator')
    this.scrollUnit = this.scrollUnit || document.body.clientWidth / this.images.length / 2;
    let nextIndex = 0;

    if (!animation) {
      this.toggleAnimateImages(true);
    }

    if (direction === Direction.Previous) {
      if (this.currentImageIndex === 0 && stopAtEnd) { return; }
      nextIndex = this.currentImageIndex === 0 ? this.images.length - 1 : this.currentImageIndex - 1;
    } else {
      if (this.currentImageIndex === this.images.length - 1 && stopAtEnd) { return; }
      nextIndex = this.currentImageIndex === this.images.length - 1 ? 0 : this.currentImageIndex + 1;
    }

    this.images[this.currentImageIndex].style.display = 'none';
    this.indicators[this.currentImageIndex].classList.remove('current');
    this.images[nextIndex].style.display = 'block';
    this.indicators[nextIndex].classList.add('current');
    this.currentImageIndex = nextIndex;
  }

  handleDoubleClick(): void {
    this.toggleAnimateImages();
  }

  handleTouchStart(e): void {
    const now = Date.now();
    if (now - this.lastTouchStart < 250) {
      this.toggleAnimateImages();
    }
    this.lastTouchStart = now;
    this.lastTouchX = e.nativeEvent.touches[0].clientX;
  }

  handleTouchMove(e): void {
    const currentX = e.nativeEvent.touches[0].clientX;
    const unitsMoved = (currentX - this.lastTouchX) / this.scrollUnit;

    let direction;
    if (unitsMoved >= 1) {
      direction = Direction.Next;
    } else if (unitsMoved <= -1) {
      direction = Direction.Previous;
    }

    if (!direction) { return; }
    this.lastTouchX = currentX;
    for (let i = 0; i < Math.floor(Math.abs(unitsMoved)); i++) {
      this.moveThoughImages(direction, false, true);
    }
  }

  handleKeydown(e) {
    console.log(`keydown: ${e.which}`);
    switch (e.which) {
      case 37:
        this.moveThoughImages(Direction.Previous, false);
        break;
      case 39: {
        this.moveThoughImages(Direction.Next, false);
        break;
      }
      default: break;
    }
  }

  render() {
    const { children, imageURLs, location } = this.props;
    let goesContainer;

    // Only render images if not on the config page
    if (location.pathname !== configPathname && imageURLs) {
      this.currentImageIndex = imageURLs.length - 1;
      const images = imageURLs.map((url, index) => {
        let imageStyle = index === this.currentImageIndex ? { display: 'block' } : { display: 'none' } as any;
        return (<img key={index} style={imageStyle} src={url} />);
      });

      const imageIndicators = imageURLs.map((x, index) => {
        const classes = index === this.currentImageIndex ? 'indicator current' : 'indicator';
        return <li key={index} className={classes}></li>;
      });

      const imagePositionIndicator = (
        <ol className="imageIndicators">{imageIndicators}</ol>
      );

      goesContainer = (
        <div id="goes-container"
          onDoubleClick={this.handleDoubleClick}
          onTouchStart={this.handleTouchStart}
          onTouchMove={this.handleTouchMove}
        >
          {imagePositionIndicator}
          <div id="goes-images">{images}</div>
        </div>
      );
    }

    return (
      <div className="page">
        {goesContainer}
        {children}
      </div>
    );
  }
}

export default GOES16Component;
