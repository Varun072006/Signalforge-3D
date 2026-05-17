export class CreatorEngineLoadingScreen {
	public loadingUIText: string = "Loading";
	public loadingUIBackgroundColor: string = "#020617";

	private _element: HTMLDivElement | null = null;

	public displayLoadingUI(): void {
		if (this._element) {
			return;
		}

		const element = document.createElement("div");
		element.id = "creatorengine-loading";
		element.innerHTML = `
			<style>
				#creatorengine-loading {
					position: fixed;
					inset: 0;
					display: grid;
					place-items: center;
					background: #020617;
					z-index: 999999;
					pointer-events: none;
				}

				#creatorengine-loading .creatorengine-loader {
					display: grid;
					place-items: center;
					gap: 18px;
				}

				#creatorengine-loading img {
					width: 120px;
					height: 120px;
					object-fit: contain;
				}

				#creatorengine-loading .creatorengine-spinner {
					width: 42px;
					height: 42px;
					border: 3px solid rgba(255, 255, 255, 0.18);
					border-top-color: #67e8f9;
					border-radius: 999px;
					animation: creatorengine-spin 0.8s linear infinite;
				}

				@keyframes creatorengine-spin {
					to {
						transform: rotate(360deg);
					}
				}
			</style>
			<div class="creatorengine-loader">
				<img src="steamified_icon.png" alt="" />
				<div class="creatorengine-spinner"></div>
			</div>
		`;

		document.body.appendChild(element);
		this._element = element;
	}

	public hideLoadingUI(): void {
		this._element?.remove();
		this._element = null;
	}
}
