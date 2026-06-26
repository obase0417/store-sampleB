// --- スクロールフェードインアニメーション ---
(() => {
  const items = document.querySelectorAll(
    ".animate-up, .about-text, .about-img-box, .recruit-img-box, .recruit-content",
  );

  items.forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(25px)";
    item.style.transition =
      "opacity 0.8s ease, transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)";
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.05,
    },
  );

  items.forEach((item) => observer.observe(item));
})();

// --- ナビゲーションバーのスクロール微調整 ---
(() => {
  const header = document.querySelector(".header");
  if (!header) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.style.padding = "12px 5%";
      header.style.boxShadow = "0 5px 20px rgba(107, 74, 50, 0.05)";
    } else {
      header.style.padding = "20px 5%";
      header.style.boxShadow = "none";
    }
  });
})();

// --- 強調版：パンの湯気・蒸気をイメージしたダイナミック背景アニメーション (Canvas) ---
(() => {
  const canvas = document.getElementById("steam-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // 粒子の数（はっきり主張させるため25個に微増）
  const particleCount = 25;
  const particles = [];

  class SteamParticle {
    constructor() {
      this.reset();
      // 初回配置時は画面全体に綺麗に散らして配置
      this.y = Math.random() * height;
    }

    reset() {
      // 画面の横幅全体からランダムに湧き上がらせる
      this.x = Math.random() * width;
      this.y = height + Math.random() * 200;

      // 初期サイズと成長速度（上昇するにつれてモヤがむくむく大きくなる表現）
      this.baseRadius = 20 + Math.random() * 20;
      this.r = this.baseRadius;
      this.growth = 0.4 + Math.random() * 0.4; // 膨らむスピード

      // 上昇速度と左右のベースベクトル
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = -(0.8 + Math.random() * 1.0); // 動きをはっきり見せるためスピードを上昇

      this.alpha = 0;
      this.maxLife = 300 + Math.random() * 200;
      this.life = this.maxLife;

      // ゆらゆら揺れる波（ウェーブ）の動きのパラメータ
      this.wobbleSpeed = 0.01 + Math.random() * 0.02;
      this.wobbleCount = Math.random() * Math.PI;
      this.wobbleAmount = 0.5 + Math.random() * 0.5;
    }

    update() {
      // 左右にゆったりと波打つ動きを計算
      this.x += this.vx + Math.sin(this.wobbleCount) * this.wobbleAmount;
      this.y += this.vy;

      // 上にいくほどモヤが大きく広がる（リアルな湯気のシミュレート）
      this.r += this.growth;

      this.wobbleCount += this.wobbleSpeed;
      this.life--;

      // 視認性向上のためのフェードイン・アウト処理（最大不透明度を0.35〜0.4まで引き上げ）
      const ageRate = (this.maxLife - this.life) / this.maxLife;

      if (ageRate < 0.2) {
        // 発生時
        this.alpha = (ageRate / 0.2) * 0.35;
      } else if (ageRate < 0.7) {
        // 中盤（一番はっきり主張する期間）
        this.alpha = 0.35;
      } else {
        // 消滅時
        this.alpha = 0.35 * (1 - (ageRate - 0.7) / 0.3);
      }

      // 寿命が尽きる、または画面最上部にはみ出したら下からリセット
      if (this.life <= 0 || this.y < -this.r) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      // 中心から外側へ綺麗に消えるグラデーション（空気感の演出）
      const grad = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        this.r,
      );
      // ほんのり温かみを感じる、美味しそうなクリームホワイトの湯気色
      grad.addColorStop(0, `rgba(245, 230, 210, ${this.alpha})`);
      grad.addColorStop(0.4, `rgba(245, 230, 210, ${this.alpha * 0.6})`);
      grad.addColorStop(1, "rgba(255, 253, 249, 0)");

      ctx.fillStyle = grad;
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 粒子の生成
  for (let i = 0; i < particleCount; i++) {
    particles.push(new SteamParticle());
  }

  // アニメーションループ
  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
})();
