$('.slider__active').slick({
    autoplay: true,       //自動再生
    autoplaySpeed: 2000,  //自動再生のスピード
    speed: 800,           //スライドするスピード
    dots: false,           //スライド下のドット
    arrows: false,         //左右の矢印
    infinite: true,       //永久にループさせる
 centerMode: false, // centerModeをfalseに
    slidesToShow: 2,
    slidesToScroll: 1,
    variableWidth: false
});
  gsap.registerPlugin(ScrollTrigger);

        function initParallax() {
            const wrappers = document.querySelectorAll('.parallax-wrapper');

            wrappers.forEach((wrapper) => {
                const image = wrapper.querySelector('.parallax-image');
                const content = wrapper.querySelector('.p-feature__cont__content');
                const textBlocks = wrapper.querySelectorAll('.text-block');

                // 画像の高さを取得
                const imageHeight = image.offsetHeight;

                // コンテンツを画像の位置に重ねる
                gsap.set(content, {
                    marginTop: -imageHeight,
                    y: imageHeight
                });

                // タイムラインを作成（セクション全体をピン留め＋コンテンツスライド）
                gsap.timeline({
                    scrollTrigger: {
                        trigger: wrapper,
                        start: 'top top', // wrapperの上端が画面上端に達したら
                        end: () => `+=${imageHeight}`,// 1画面分スクロールで完了
                        scrub: true,
                        pin: true, // セクション全体を固定
                        pinSpacing: true, // スペースを確保
                        invalidateOnRefresh: true,
         
                    }
                })
                .to(content, {
                    y: 0,
                    ease: 'none'
                });

                // テキストブロックのフェードイン
                textBlocks.forEach((block, index) => {
                    gsap.to(block, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        delay: index,
                        scrollTrigger: {
                            trigger: wrapper,
                            start: 'top top',
                            toggleActions: 'play none none none'
                        }
                    });
                });
            });

            // リサイズ時にScrollTriggerをリフレッシュ
            window.addEventListener('resize', () => {
                ScrollTrigger.refresh();
            });
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initParallax);
        } else {
            initParallax();
        }

/* ★ iPad横向き専用のScrollTrigger.refresh */
const isIpad = /iPad|Macintosh/.test(navigator.userAgent) 
               && navigator.maxTouchPoints > 1;

window.addEventListener("orientationchange", () => {
  if (isIpad && (window.orientation === 90 || window.orientation === -90)) {
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);
  }
});
document.addEventListener('DOMContentLoaded', function () {
    const cross = document.querySelector('.c-cross');
    const header = document.querySelector('header');
    const fv = document.querySelector('.p-fv.l-fv');

    console.log('cross:', cross); // デバッグ用
    console.log('header:', header); // デバッグ用
    console.log('fv:', fv); // デバッグ用

    if (cross && header && fv) {
        // clickの代わりにtouchstartも追加
        cross.addEventListener('click', function (e) {
            e.preventDefault(); // デフォルト動作を防ぐ
            console.log('Cross clicked!'); // デバッグ用
            
            // headerをフェードアウト
            header.classList.add('is-hidden');

            // fvのpadding-topを0に（スライドするように）
            fv.classList.add('no-padding');
        });

        // タッチデバイス用
        cross.addEventListener('touchend', function (e) {
            e.preventDefault();
            console.log('Cross touched!'); // デバッグ用
            
            header.classList.add('is-hidden');
            fv.classList.add('no-padding');
        });
    } else {
        console.log('要素が見つかりません'); // デバッグ用
    }
});
// ユーザーが「関わっているか」を管理するフラグ
let isHover = false;        // マウスがスライダーの上にあるか（PC）
let isPointerDown = false;  // クリック／タップで掴んでいるか（PC・スマホ）

// 表示・非表示をまとめて制御する関数
function updateFeatureBox() {
  if (isHover || isPointerDown) {
    // ユーザーが関わっている間はフェードアウト（邪魔なので消す）
    $('.p-feature__cont_user_box').stop(true, true).fadeOut(300);
  } else {
    // 何もしていないときはフェードイン（普通に見せる）
    $('.p-feature__cont_user_box').stop(true, true).fadeIn(300);
  }
}

// PC：カーソルが乗った／離れた
$('.slider')
  .on('mouseenter', function() {
    isHover = true;           // ホバー開始
    updateFeatureBox();       // 状態に応じてフェード処理
  })
  .on('mouseleave', function() {
    isHover = false;          // ホバー終了
    updateFeatureBox();
  });

// PC & スマホ：掴み始め／離した
$('.slider')
  .on('mousedown touchstart', function() {
    isPointerDown = true;     // 掴み中
    updateFeatureBox();
  })
  .on('mouseup touchend touchcancel', function() {
    isPointerDown = false;    // 掴み終了
    updateFeatureBox();
  });