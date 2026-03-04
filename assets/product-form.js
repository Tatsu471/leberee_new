if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();
        this.form = this.querySelector('form');
        this.variantIdInput = this.form.querySelector('[name="id"]');
        this.variantIdInput.disabled = false;

        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton?.querySelector('span');

        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      }

      // 🔧 追加部分：外部から variantId を明示的にセットする
      setVariantId(value) {
        if (this.variantIdInput) {
          this.variantIdInput.value = value;
          this.variantIdInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      toggleSubmitButton(disable = true, text) {
        if (!this.submitButton) return;

        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.removeAttribute('disabled');
          if (this.submitButtonText && window.variantStrings?.addToCart) {
            this.submitButtonText.textContent = window.variantStrings.addToCart;
          }
        }
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading__spinner')?.classList.remove('hidden');

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        console.log(formData.get('id'));

        if (this.cart) {
          formData.append('sections', this.cart.getSectionsToRender().map((section) => section.id));
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }

        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((res) => res.json())
          .then((res) => {
            if (res.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                errors: res.errors || res.description,
                message: res.message,
              });
              this.handleErrorMessage(res.description);
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }

            publish(PUB_SUB_EVENTS.cartUpdate, {
              source: 'product-form',
              productVariantId: formData.get('id'),
              cartData: res,
            });

            this.cart.renderContents(res);
          })
          .catch(console.error)
          .finally(() => {
            this.submitButton.classList.remove('loading');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            this.querySelector('.loading__spinner')?.classList.add('hidden');
          });
      }
    }
  );
}