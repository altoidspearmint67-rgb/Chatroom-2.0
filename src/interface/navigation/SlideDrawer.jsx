const ANIM_MS = 150;

const VEL_MS = 33;

const VEL_AVG = 5;

const VEL_TRIG = 0.3;

const TRIG_X = 10;

const CANCEL_Y = 20;

export const SlideState =
  Object.freeze({
    HIDDEN: 1,
    SHOWN: 2,
    HIDING: 3,
    SHOWING: 4,
    MOVING: 5,
  });

export class SlideDrawer {
  constructor(
    drawer,
    root,
  ) {
    this.drawer =
      drawer;

    this.root =
      root;

    this.touch =
      null;

    this.tTmr =
      null;

    this.vTmr =
      null;

    this.lShow =
      true;

    this.ofs =
      0;

    this._enabled =
      false;

    this._state =
      SlideState.HIDDEN;

    this.start =
      this.start.bind(
        this,
      );

    this.move =
      this.move.bind(
        this,
      );

    this.handleMedia =
      this.handleMedia.bind(
        this,
      );

    root.addEventListener(
      "touchstart",
      this.start,
      {
        passive: true,
      },
    );

    root.addEventListener(
      "touchmove",
      this.move,
      {
        passive: false,
      },
    );

    root.addEventListener(
      "touchend",
      this.move,
      {
        passive: false,
      },
    );

    this.media =
      window.matchMedia(
        "(max-width: 768px)",
      );

    this.media.addEventListener(
      "change",
      this.handleMedia,
    );

    this.handleMedia();
  }

  handleMedia() {
    this.enabled =
      this.media.matches;
  }

  start(event) {
    if (
      event.touches.length >
      1
    ) {
      this.endTouch();

      return;
    }

    if (
      this.touch ||
      !this._enabled
    ) {
      return;
    }

    const touch =
      event.touches[0];

    this.touch = {
      id: touch.identifier,
      x: touch.screenX,
      y: touch.screenY,
    };
  }

  move(event) {
    if (!this.touch) {
      return;
    }

    const isEnd =
      event.type ===
      "touchend";

    let nextTouch;

    for (
      const changedTouch
      of event.changedTouches
    ) {
      if (
        changedTouch.identifier ===
        this.touch.id
      ) {
        nextTouch =
          changedTouch;

        break;
      }
    }

    if (!nextTouch) {
      return;
    }

    const tracked =
      this.touch;

    const dy =
      nextTouch.screenY -
      tracked.y;

    const drawerStyle =
      this.drawer.style;

    const max =
      -window.innerWidth;

    let dx =
      nextTouch.screenX -
      tracked.x;

    let triggered =
      tracked.trig;

    if (
      !triggered &&
      Math.abs(dy) >
        CANCEL_Y
    ) {
      this.endTouch();
    } else if (
      triggered ||
      Math.abs(dx) >
        TRIG_X
    ) {
      const type =
        triggered
          ? "new"
          : "prev";

      tracked[
        `${type}X`
      ] = dx;

      tracked[
        `${type}T`
      ] =
        performance.now();

      if (!triggered) {
        tracked.trig =
          true;

        triggered =
          true;

        this.transformTimer();

        this.velocityTimer();

        if (!isEnd) {
          this._state =
            SlideState.MOVING;
        }

        if (
          document.activeElement instanceof
          HTMLElement
        ) {
          document.activeElement.blur();
        }
      }

      dx = Math.max(
        Math.min(
          this.ofs +
            dx,
          0,
        ),
        max,
      );

      if (!isEnd) {
        drawerStyle.transform =
          `translateX(${dx}px)`;
      }

      event.preventDefault();

      event.stopPropagation();
    }

    if (isEnd) {
      if (triggered) {
        this.addVelocity();

        let velocity =
          0;

        if (
          tracked.vAvg
            ?.length
        ) {
          for (
            const value
            of tracked.vAvg
          ) {
            velocity +=
              value;
          }

          velocity /=
            tracked.vAvg
              .length;
        }

        let show =
          dx < max / 2;

        if (
          velocity >
          VEL_TRIG
        ) {
          show =
            false;
        } else if (
          velocity <
          -VEL_TRIG
        ) {
          show =
            true;
        }

        this.transformTimer(
          true,
          show,
        );
      }

      this.endTouch();
    }
  }

  velocityTimer() {
    if (this.vTmr) {
      return;
    }

    this.vTmr =
      window.setInterval(
        () =>
          this.addVelocity(),
        VEL_MS,
      );
  }

  addVelocity(
    skipStale = false,
  ) {
    const tracked =
      this.touch;

    if (
      !tracked ||
      !tracked.newT
    ) {
      return;
    }

    const stale =
      tracked.prevT ===
      tracked.newT;

    const velocity =
      stale
        ? 0
        : (tracked.newX -
            tracked.prevX) /
          (tracked.newT -
            tracked.prevT);

    if (
      stale &&
      skipStale
    ) {
      return;
    }

    tracked.prevX =
      tracked.newX;

    tracked.prevT =
      tracked.newT;

    if (
      tracked.vAvg
    ) {
      tracked.vAvg[
        tracked.vOfs
      ] = velocity;

      tracked.vOfs += 1;

      if (
        tracked.vOfs ===
        VEL_AVG
      ) {
        tracked.vOfs =
          0;
      }
    } else {
      tracked.vAvg = [
        velocity,
      ];

      tracked.vOfs =
        1;
    }
  }

  endTouch() {
    if (this.vTmr) {
      clearInterval(
        this.vTmr,
      );
    }

    this.touch =
      null;

    this.vTmr =
      null;
  }

  transformTimer(
    set = false,
    show = false,
  ) {
    const drawerStyle =
      this.drawer.style;

    this.setElementState(
      false,
    );

    if (set) {
      this.ofs =
        show
          ? -window.innerWidth
          : 0;

      drawerStyle.transition =
        `transform ${ANIM_MS}ms ease-out`;

      drawerStyle.transform =
        `translateX(${this.ofs}px)`;

      this._state =
        show
          ? SlideState.SHOWING
          : SlideState.HIDING;
    } else {
      drawerStyle.transition =
        "";

      drawerStyle.transform =
        "";
    }

    if (this.tTmr) {
      clearTimeout(
        this.tTmr,
      );
    }

    this.tTmr =
      set
        ? window.setTimeout(
            () => {
              drawerStyle.transition =
                "";

              drawerStyle.transform =
                "";

              this.setElementState(
                show,
              );

              this.tTmr =
                null;

              this._state =
                show
                  ? SlideState.SHOWN
                  : SlideState.HIDDEN;
            },
            ANIM_MS +
              50,
          )
        : null;
  }

  setElementState(
    show,
  ) {
    const drawerStyle =
      this.drawer.style;

    this.root.style.width =
      show
        ? ""
        : "200vw";

    drawerStyle.marginLeft =
      show
        ? ""
        : "100vw";
  }

  delete() {
    this.enabled =
      false;

    this.root.removeEventListener(
      "touchstart",
      this.start,
    );

    this.root.removeEventListener(
      "touchmove",
      this.move,
    );

    this.root.removeEventListener(
      "touchend",
      this.move,
    );

    this.media?.removeEventListener(
      "change",
      this.handleMedia,
    );
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(
    enabled,
  ) {
    if (
      this._enabled ===
      enabled
    ) {
      return;
    }

    this.drawer.style.zIndex =
      enabled
        ? "1"
        : "";

    this.transformTimer();

    this.endTouch();

    if (!enabled) {
      this.lShow =
        this._state ===
        SlideState.SHOWN;
    }

    const show =
      enabled
        ? this.lShow
        : false;

    this.setElementState(
      !enabled ||
        show,
    );

    this.ofs =
      show
        ? -window.innerWidth
        : 0;

    this._enabled =
      enabled;

    this._state =
      show
        ? SlideState.SHOWN
        : SlideState.HIDDEN;
  }

  get state() {
    return this._state;
  }

  setShown(show) {
    if (
      !this._enabled ||
      this.touch?.trig ||
      this.tTmr
    ) {
      return false;
    }

    if (
      (this.ofs !==
        0) !==
      show
    ) {
      this.setElementState(
        false,
      );

      this.drawer.style.transform =
        `translateX(${this.ofs}px)`;

      window.setTimeout(
        () =>
          this.transformTimer(
            true,
            show,
          ),
        1,
      );
    }

    return true;
  }
}