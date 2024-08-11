import type { FrameBlockModel } from '@blocksuite/affine-model';

import { WithDisposable } from '@blocksuite/block-std';
import { Bound } from '@blocksuite/global/utils';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import type { EdgelessRootBlockComponent } from '../../edgeless-root-block.js';

@customElement('edgeless-navigator-black-background')
export class EdgelessNavigatorBlackBackground extends WithDisposable(
  LitElement
) {
  private _blackBackground = false;

  static override styles = css`
    .edgeless-navigator-black-background {
      background-color: black;
      position: absolute;
      z-index: 1;
      background-color: transparent;
      box-shadow: 0 0 0 5000px black;
    }
  `;

  private _tryLoadBlackBackground() {
    const value = this.edgeless.service.editPropsStore.getStorage(
      'presentBlackBackground'
    );
    this._blackBackground = value ?? true;
  }

  override firstUpdated() {
    const { _disposables, edgeless } = this;
    _disposables.add(
      edgeless.slots.navigatorFrameChanged.on(frame => {
        this.frame = frame;
      })
    );

    _disposables.add(
      edgeless.slots.navigatorSettingUpdated.on(({ blackBackground }) => {
        if (blackBackground !== undefined) {
          this.edgeless.service.editPropsStore.setStorage(
            'presentBlackBackground',
            blackBackground
          );

          this._blackBackground = blackBackground;

          this.show =
            blackBackground && edgeless.edgelessTool.type === 'frameNavigator';
        }
      })
    );

    _disposables.add(
      edgeless.slots.edgelessToolUpdated.on(tool => {
        if (tool.type !== 'frameNavigator') {
          this.show = false;
        } else {
          this.show = this._blackBackground;
        }
      })
    );

    _disposables.add(
      edgeless.slots.fullScreenToggled.on(
        () =>
          setTimeout(() => {
            this.requestUpdate();
          }, 500) // wait for full screen animation
      )
    );

    this._tryLoadBlackBackground();
  }

  override render() {
    const { edgeless, frame, show } = this;

    if (!show || !frame) return nothing;

    const bound = Bound.deserialize(frame.xywh);
    const zoom = edgeless.service.viewport.zoom;
    const width = bound.w * zoom;
    const height = bound.h * zoom;
    const [x, y] = edgeless.service.viewport.toViewCoord(bound.x, bound.y);

    return html` <style>
        .edgeless-navigator-black-background {
          width: ${width}px;
          height: ${height}px;
          top: ${y}px;
          left: ${x}px;
        }
      </style>
      <div class="edgeless-navigator-black-background"></div>`;
  }

  @property({ attribute: false })
  accessor edgeless!: EdgelessRootBlockComponent;

  @state()
  private accessor frame: FrameBlockModel | undefined = undefined;

  @state()
  private accessor show = false;
}

declare global {
  interface HTMLElementTagNameMap {
    'edgeless-navigator-black-background': EdgelessNavigatorBlackBackground;
  }
}
