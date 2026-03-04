// 診断ロジック（3ステップ x 3選択肢 = 27パターン）
const diagnosisSteps = document.querySelectorAll('.diagnosis_step__contents');
const resultBoxes = document.querySelectorAll('.diagnosis_result_box');
let selections = []; // 選択内容を保持

// ステップを全て非表示にして最初のステップのみ表示
function initializeSteps() {
  for (let i = 0; i < 3; i++) {
    const step = document.querySelector(`.js-diagnosis_step--${i + 1}`);
    // if (step) step.classList.remove('is-visible');
  }
  const firstStep = document.querySelector(`.js-diagnosis_step--1`);
  if (firstStep) firstStep.classList.add('is-visible');

  // resultBoxes.forEach(box => box.classList.remove('is-visible'));
}
initializeSteps();

// 各STEPの選択肢にクリックイベントを付与
diagnosisSteps.forEach((stepContent, index) => {
  const items = stepContent.querySelectorAll('li');
  items.forEach((item) => {
    item.addEventListener('click', () => {
      // 選択状態のスタイル適用
      items.forEach(li => li.classList.remove('is-selected'));
      item.classList.add('is-selected');

      const selectedText = item.textContent.trim();
      console.log(`STEP ${index + 1} 選択: ${selectedText}`);
      selections[index] = selectedText;

      const currentStep = document.querySelector(`.js-diagnosis_step--${index + 1}`);
      // if (currentStep) currentStep.classList.remove('is-visible');

      if (index + 1 < 3) {
        updateStepSelectionDisplay(index + 1); // ← 次に表示されるステップ番号を指定
        const nextStep = document.querySelector(`.js-diagnosis_step--${index + 2}`);
        if (nextStep) nextStep.classList.add('is-visible');
      }

      // 3つ全て選択済みの場合は常に結果を更新して表示する
      if (selections[0] && selections[1] && selections[2]) {
        showFinalSelections(); // ← 最終結果表示用
        showResult(selections);
      }
    });
  });
});
function updateStepSelectionDisplay(stepIndex) {
  // STEP2, STEP3, 結果時の表示に応じて切替
  if (stepIndex === 1) {
    const infoBox = document.getElementById('step-selected-info-2');
    if (infoBox) {
      infoBox.innerHTML = `<strong>STEP1:</strong> ${selections[0] || '未選択'}`;
    }
  } else if (stepIndex === 2) {
    const infoBox = document.getElementById('step-selected-info-3');
    if (infoBox) {
      infoBox.innerHTML = `
        <strong>STEP1:</strong> ${selections[0] || '未選択'}<br>
        <strong>STEP2:</strong> ${selections[1] || '未選択'}
      `;
    }
  }
}
function showFinalSelections() {
  const infoBox = document.getElementById('step-selected-info-final');
  if (infoBox) {
    infoBox.innerHTML = `
      <strong>STEP1:</strong> ${selections[0]}<br>
      <strong>STEP2:</strong> ${selections[1]}<br>
      <strong>STEP3:</strong> ${selections[2]}
    `;
  }
}
function showResult(selections) {
  const normalized = selections.map(str => str.replace(/~/g, '〜').trim());
  const key = normalized.join('|');
  const resultKey = resultMapping[key];

  // すべて非表示に
  document.querySelectorAll('.diagnosis_result_box').forEach(box => {
    box.classList.remove('is-visible');
    box.style.display = 'none'; // ← ← ← ここで display: none を強制的に適用
  });

  // 動的商品のコンテナをクリア
  const container = document.getElementById('diagnosis-result-container');
  if (container) container.innerHTML = '';


  // 診断結果ボックスの表示処理
  if (resultKey) {
    // 1. 静的な結果ボックスを表示 (Size, Model info)
    const resultBox = document.querySelector(`.diagnosis_result_box[data-result="${resultKey}"]`);
    if (resultBox) {
      resultBox.style.display = 'flex'; // 先に表示
      setTimeout(() => {
        resultBox.classList.add('is-visible');
      }, 50);
    }

    // 2. 動的な商品リストを表示 (Recommended Products)
    console.log('Trying to render products for key:', resultKey);
    console.log('Data found:', window.diagnosisData ? window.diagnosisData[resultKey] : 'No diagnosisData object');
    if (window.diagnosisData) {
      console.log('Available keys:', Object.keys(window.diagnosisData));
    }

    if (window.diagnosisData && window.diagnosisData[resultKey]) {
      const dataList = window.diagnosisData[resultKey]; // 配列
      const template = document.getElementById('diagnosis-result-template');
      const items = Array.isArray(dataList) ? dataList : [dataList];

      console.log('Template found:', !!template);
      console.log('Container found:', !!container);

      if (template && container) {
        items.forEach((data, index) => {
          console.log('Appending product:', data.title);
          const clone = template.cloneNode(true);
          clone.id = ''; // ID重複回避
          clone.style.display = 'block'; // テンプレートは非表示なので表示にする

          // 画像
          const img = clone.querySelector('.js-result-image');
          if (img) {
            img.src = data.imageSrc;
            img.alt = data.title;
          }

          // タイトル
          const title = clone.querySelector('.js-result-model-name');
          if (title) title.textContent = data.title;

          // 金額
          const price = clone.querySelector('.js-result-price');
          if (price) price.textContent = data.price;

          // リンク
          const link = clone.querySelector('.js-result-link');
          if (link) link.href = data.productUrl;

          // アニメーション用クラス付与 (必要なら)
          clone.style.opacity = '0';
          clone.style.transition = 'opacity 0.6s ease';
          setTimeout(() => {
            clone.style.opacity = '1';
          }, 100 + (index * 100)); // 順番にフェードイン

          container.appendChild(clone);
        });
      }
    }
  }
}

// 27ルートのうち、任意のキーに対応する出力結果
const resultMapping = {
  "しっかりホールドされたい|A〜B|細め": "S-S",
  "しっかりホールドされたい|A〜B|普通": "S-S",
  "しっかりホールドされたい|A〜B|大きめ": "S-M",
  "しっかりホールドされたい|C〜E|細め": "S-S",
  "しっかりホールドされたい|C〜E|普通": "S-S",
  "しっかりホールドされたい|C〜E|大きめ": "S-M",
  "しっかりホールドされたい|F〜|細め": "H-S",
  "しっかりホールドされたい|F〜|普通": "H-M",
  "しっかりホールドされたい|F〜|大きめ": "H-M",
  "ホールド力はほどほどが良い|A〜B|細め": "S-M",
  "ホールド力はほどほどが良い|A〜B|普通": "S-M",
  "ホールド力はほどほどが良い|A〜B|大きめ": "S-M",
  "ホールド力はほどほどが良い|C〜E|細め": "S-M",
  "ホールド力はほどほどが良い|C〜E|普通": "S-M",
  "ホールド力はほどほどが良い|C〜E|大きめ": "S-L",
  "ホールド力はほどほどが良い|F〜|細め": "H-M",
  "ホールド力はほどほどが良い|F〜|普通": "H-M",
  "ホールド力はほどほどが良い|F〜|大きめ": "H-L",
  "ホールド力はあまり求めない|A〜B|細め": "HC-M",
  "ホールド力はあまり求めない|A〜B|普通": "HC-M",
  "ホールド力はあまり求めない|A〜B|大きめ": "HC-M",
  "ホールド力はあまり求めない|C〜E|細め": "HC-M",
  "ホールド力はあまり求めない|C〜E|普通": "HC-L",
  "ホールド力はあまり求めない|C〜E|大きめ": "HC-L",
  "ホールド力はあまり求めない|F〜|細め": "HC-M",
  "ホールド力はあまり求めない|F〜|普通": "HC-L",
  "ホールド力はあまり求めない|F〜|大きめ": "HC-L"
};