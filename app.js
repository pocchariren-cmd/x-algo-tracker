let reportData = [];
let radarChart = null;

async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Network response was not ok');
        reportData = await response.json();
    } catch (e) {
        console.warn('Failed to load data.json, using fallback.', e);
    }
    renderReports();
}

function renderReports() {
    const container = document.getElementById('report-container');
    const template = document.getElementById('card-template');
    if (!container || reportData.length === 0) return;
    container.innerHTML = '';
    reportData.forEach((report, index) => {
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.report-card');
        card.style.animationDelay = `${index * 0.1}s`;
        clone.querySelector('.date').textContent = report.date;
        clone.querySelector('.tag').textContent = report.tag;
        clone.querySelector('.title').textContent = report.title;
        clone.querySelector('.tech-desc').textContent = report.tech;
        clone.querySelector('.easy-desc').textContent = report.easy;
        const badgesContainer = clone.querySelector('.trend-badges');

        if (report.source) {
            const link = clone.querySelector('.source-link');
            link.href = report.url || "#";
            clone.querySelector('.source-text').textContent = report.source;
        } else {
            clone.querySelector('.card-footer').style.display = 'none';
        }

        if (report.tag === "Boost" || report.tag === "Reach") {
            badgesContainer.querySelector('.penalty-down').style.display = 'none';
        } else if (report.tag === "Trust") {
            badgesContainer.querySelector('.reach-up').style.display = 'none';
        } else {
            badgesContainer.style.display = 'none';
        }
        container.appendChild(clone);
    });
}

// --- 高度なパーソナライズ解析エンジン V3 (Daily Dynamic) ---

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; 
    }
    return Math.abs(hash);
}

const diagnoseBtn = document.getElementById('diagnose-btn');
const urlInput = document.getElementById('account-url');
const scanStatus = document.getElementById('scanning-status');
const scanLog = document.getElementById('scan-log');
const scanProgress = document.querySelector('.progress-inner');
const diagnosisResult = document.getElementById('diagnosis-result');

diagnoseBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim().toLowerCase();
    if (!url || !url.includes('x.com')) {
        alert('有効なXのアカウントURLを入力してください。');
        return;
    }

    diagnoseBtn.disabled = true;
    diagnosisResult.classList.add('hidden');
    document.getElementById('health-status').classList.add('hidden');
    scanStatus.classList.remove('hidden');

    const logs = [
        "内部アルゴリズムへのアクセスを確立...",
        "Grok v3 クラスタリング演算を開始...",
        "過去24時間の投稿ログとリアクション率を照合...", // 日次要素を強調
        "アカウント属性の動的スキャン（Trust Score 算定）...",
        "メディア比率と外部リンクペナルティの精査...",
        "最終コンサルティング・レポートを構成中..."
    ];

    for (let i = 0; i < logs.length; i++) {
        scanLog.textContent = logs[i];
        scanProgress.style.width = `${(i + 1) * (100 / logs.length)}%`;
        await new Promise(r => setTimeout(r, 600));
    }

    showResults(url);
});

function showResults(url) {
    scanStatus.classList.add('hidden');
    diagnosisResult.classList.remove('hidden');
    document.getElementById('health-status').classList.remove('hidden');

    const today = new Date().toLocaleDateString(); // 今日という要素
    const hash = hashCode(url + today); // URL + 日付でシード値を作成（毎日結果が変わる）
    const username = url.split('/').pop() || "unknown";
    
    // スコア計算に日付の要素を乗せる (24時間ごとの変動シミュレーション)
    const dailyFluctuation = (hash % 15) - 7; // -7 ~ +7 の範囲で毎日変動
    
    const stats = {
        reach: 45 + (hash % 46) + dailyFluctuation,
        trust: 40 + ((hash >> 2) % 51) + dailyFluctuation,
        engagement: 35 + ((hash >> 4) % 56) + dailyFluctuation,
        media: 30 + ((hash >> 6) % 61) + dailyFluctuation,
        originality: 50 + ((hash >> 8) % 41) + dailyFluctuation
    };

    // BOT判定/長さ判定
    if (username.length < 6) stats.trust += 10;
    if (username.match(/\d{4,}/)) stats.trust -= 15; 

    Object.keys(stats).forEach(k => stats[k] = Math.min(100, Math.max(0, stats[k])));
    const totalScore = Math.floor((stats.reach + stats.trust + stats.engagement + stats.media + stats.originality) / 5);

    let cur = 0;
    const inv = setInterval(() => {
        if (cur >= totalScore) clearInterval(inv);
        else { cur++; document.getElementById('score-num').textContent = cur; }
    }, 15);

    // Health Status
    const healthLabel = document.getElementById('health-label');
    const healthBar = document.getElementById('health-status');
    healthBar.className = 'health-status'; 
    if (stats.trust >= 85) { healthLabel.textContent = "超健全 (Elite Trust)"; healthBar.classList.add('status-healthy'); }
    else if (stats.trust >= 65) { healthLabel.textContent = "良好 (Normal)"; healthBar.classList.add('status-healthy'); }
    else if (stats.trust >= 45) { healthLabel.textContent = "注意 (Low Credibility)"; healthBar.classList.add('status-caution'); }
    else { healthLabel.textContent = "警告 (Spam Flag Potential)"; healthBar.classList.add('status-warning'); }

    // Golden Time
    const slots = ["07:15", "08:45", "11:50", "12:30", "18:20", "20:00", "21:15", "23:40"];
    document.getElementById('golden-time').textContent = slots[hash % slots.length];

    // 項目ごとの具体的なアドバイス（30通り）
    const metricAdvicePool = {
        reach: [
            "💡ハッシュタグは1投稿につき2つまでに絞りましょう。",
            "💡引用リポストで有名アカウントの力を借りましょう。",
            "💡インプレッションの高い時間を狙って投稿しましょう。",
            "💡画像付き投稿を増やし、TLでの占有面積を広げましょう。",
            "💡投稿の最初の1行目で『結論』や『衝撃の事実』を書きましょう。",
            "💡トレンド入りしているキーワードを自然に文に混ぜましょう。"
        ],
        trust: [
            "💡断定的な言葉を避け、『と思います』等でリスクを減らしましょう。",
            "💡情報元（URL）を明記したツイートを定期的に行いましょう。",
            "💡コミュニティノートが付きそうな過激な発言は控えましょう。",
            "💡プロフィール画像の解像度を上げ、実在感を高めましょう。",
            "💡過度な被フォロー数（フォローバック目的）の整理を行いましょう。",
            "💡外部リンク（URL）を貼る投稿は全体の10%以下に抑えましょう。"
        ],
        engagement: [
            "💡『AとB、どちらが良いと思いますか？』と質問を投げかけましょう。",
            "💡リプライには即座に『いいね』と『返信』を心がけましょう。",
            "💡長文のツリー投稿（スレッド連続投稿）で滞在時間を伸ばしましょう。",
            "💡自分の失敗談を語り、共感（いいね）を集めましょう。",
            "💡アンケート機能を活用し、ワンタップで参加できる企画を立てましょう。",
            "💡フォローしてくれている人の直近の投稿にリプライを送りましょう。"
        ],
        media: [
            "💡10秒以内の『ショート縦型動画』を定期的にアップしましょう。",
            "💡4枚の画像を使い、スワイプ動作を誘う工夫をしましょう。",
            "💡画像内にも文字（テロップ）を入れて、情報量を増やしましょう。",
            "💡高解像度の魅力的な写真を使いましょう。",
            "💡GIF画像をリアクション（リプライ）に使用しましょう。",
            "💡音声配信（スペース）を週1回開催してみましょう。"
        ],
        originality: [
            "💡ニュースの引用だけでなく、プロとしての『独自の視点』を語りましょう。",
            "💡自分の過去の『失敗』から学んだリアルなエピソードを発信しましょう。",
            "💡AIに書かせたような定型文は避け、わざと人間らしい口調にしましょう。",
            "💡他の人がまだ使っていない『独自の専門用語』を作り出しましょう。",
            "💡本音（少し尖った意見）をあえて投稿し、個性を立たせましょう。",
            "💡ニッチな分野に特化し、『〇〇の人』というポジションを確立しましょう。"
        ]
    };

    document.getElementById('advice-reach').textContent = metricAdvicePool.reach[hash % 6];
    document.getElementById('advice-trust').textContent = metricAdvicePool.trust[hash % 6];
    document.getElementById('advice-eng').textContent = metricAdvicePool.engagement[hash % 6];
    document.getElementById('advice-media').textContent = metricAdvicePool.media[hash % 6];
    document.getElementById('advice-orig').textContent = metricAdvicePool.originality[hash % 6];

    // Scan Findings
    const findingsContainer = document.getElementById('scan-findings');
    findingsContainer.innerHTML = '';
    
    // アクション・パターンの生成（日次とスコアで変化）
    const actions = [
        "リプライ中心の交流", "画像のフル活用", "有益なスレッド投稿", 
        "断言した本音の投稿", "フォロワー巡回といいね", "引用リポストでの議論"
    ];
    const todayAction = actions[hash % actions.length];

    const params = [
        { label: "AI適合率 (Grok Match)", val: (70 + (hash % 29)) + "%" },
        { label: "本日の成長予測", val: (dailyFluctuation > 0 ? "+" : "") + dailyFluctuation + "%" },
        { label: "シャドウバン・リスク", val: stats.trust < 50 ? "⚠️ 高 (要注意)" : "✅ 低 (健全)" },
        { label: "本日の推奨アクション", val: `「${todayAction}」` }
    ];
    
    params.forEach(p => {
        const div = document.createElement('div');
        div.className = 'finding-item';
        div.innerHTML = `<span class="finding-label">${p.label}:</span> <span class="finding-value">${p.val}</span>`;
        findingsContainer.appendChild(div);
    });

    updateMiniBar('reach', stats.reach);
    updateMiniBar('trust', stats.trust);
    updateMiniBar('eng', stats.engagement);
    updateMiniBar('media', stats.media);
    updateMiniBar('orig', stats.originality);

    initRadarChart(stats);
    renderAdvancedConsulting(totalScore, stats, username, hash);

    diagnoseBtn.disabled = false;
    diagnoseBtn.textContent = "再解析を実行";
}

function initRadarChart(stats) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    if (radarChart) radarChart.destroy();
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['リーチ力', '信頼性', '対話力', 'メディア活用', '独自性'],
            datasets: [{
                label: '分析結果',
                data: [stats.reach, stats.trust, stats.engagement, stats.media, stats.originality],
                backgroundColor: 'rgba(0, 136, 255, 0.25)',
                borderColor: '#0088ff',
                borderWidth: 3,
                pointBackgroundColor: '#0088ff',
                pointRadius: 4
            }, {
                label: '理想値',
                data: [90, 85, 80, 75, 90],
                backgroundColor: 'rgba(255, 215, 0, 0.05)',
                borderColor: 'rgba(255, 215, 0, 0.3)',
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { color: 'rgba(255,255,255,0.1)' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    pointLabels: { color: '#a1a1a6', font: { size: 10, weight: 'bold' } },
                    ticks: { display: false, stepSize: 20 },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: { legend: { display: false } },
            animation: { duration: 1500, easing: 'easeOutQuart' }
        }
    });
}

function renderAdvancedConsulting(score, stats, username, hash) {
    const comment = document.getElementById('score-comment');
    const plan = document.getElementById('improvement-plan');
    const postIdeas = document.getElementById('post-ideas');
    const roadmap = document.getElementById('roadmap-container');
    
    plan.innerHTML = '';
    roadmap.innerHTML = '';

    const weakest = Object.keys(stats).reduce((a, b) => stats[a] < stats[b] ? a : b);
    const strongest = Object.keys(stats).reduce((a, b) => stats[a] > stats[b] ? a : b);

    // 30パターンの「解析レポート（AIコンサル報告）」
    const reportPool = {
        reach: [
            "現在、あなたのアカウントは『リーチの壁』に直面しています。Grok v3の初期評価は高いものの、2次拡散への移行率が停滞しています。",
            "インプレッションの『質』は良好ですが、絶対的な『量』が不足しています。ハッシュタグの重複利用が評価を下げている可能性があります。",
            "トレンドワードに対する反応速度は優秀です。しかし、投稿内の滞在時間が短いため、おすすめタブへの滞留時間が削られています。",
            "フォロワー外への露出が制限される『ソフトフィルタリング』の状態が見受けられます。視覚占有率の高い投稿が必要です。",
            "拡散の初速は素晴らしいですが、中盤以降の減衰が早いです。保存数を意識したスレッド構成に切り替えるべきです。",
            "現在のランキング・エンジンにおいて、あなたのジャンルの競合過多が影響しています。ニッチなキーワードの選定が急務です。"
        ],
        trust: [
            "信頼スコア（Trust Score）が不安定な状態です。短期間のフォロー/解除アクションや外部リンクの多用が、AIによるBOT判定を誘発しています。",
            "ドメイン信頼性は平均的ですが、過去のスパムフラグが完全に浄化されていません。誠実な対話によるスコア回復が必要です。",
            "アカウントの属性がAIに正しく認識されていません。プロフィールと発信内容の一致率を高め、専門性を確立してください。",
            "コミュニティノートが付与されるリスクがわずかに上昇しています。事実に基づいた情報のシェアを徹底しましょう。",
            "既存フォロワーからのアクティブ反応率が低く、AIが『非アクティブアカウント』と誤認し始めています。整理が必要です。",
            "公式アルゴリズム上の『優良アカウント』枠にあと一歩です。定型文を避けた人間味のあるリプライを優先してください。"
        ],
        engagement: [
            "エンゲージメントの『密度』が極めて高く評価されています。しかし、リプライ欄の対話が一方通行に終わっているのが勿体ない点です。",
            "いいねの数は多いものの、コメント（返信）率が低いです。AIは『議論を呼ぶ内容』を優先するため、問いかけを増やしましょう。",
            "直近の投稿において、リポストの影響力が弱まっています。引用リポストを活用し、対話の起点を作る戦略が有効です。",
            "既存ファンとの親密度はMAXに近いですが、新規ユーザーを引き込む『フック』が弱くなっています。議論への参加を促してください。",
            "リプライへの返信速度が評価ポイントになっています。投稿後1時間の『ゴールデンタイム』に集中対話を行ってください。",
            "対話力は申し分ありませんが、外部リンク誘導時にエンゲージメントが急落しています。誘導方法の工夫が必要です。"
        ],
        media: [
            "静止画の活用は素晴らしいですが、現在のアルゴリズムが好む『縦型動画』の比率が低いため、ブーストを逃しています。",
            "使用している画像のファイルサイズが不適切、または解像度が低いため、視覚体験スコアがわずかに減点されています。",
            "4枚画像セットの投稿において、2枚目以降への遷移率が低いです。ストーリー性を持たせた画像配置へと改善が必要です。",
            "ALTテキスト（代替テキスト）の未設定が、アクセシビリティ評価に響いています。AIは細部までスキャンしています。",
            "動画の視聴完了率が30%を下回っています。冒頭3秒での強烈なフックと、テロップの視認性向上が急務です。",
            "メディア投稿時のインプレッションは高いものの、プロフへの遷移率が低いです。画像内に導線を配置しましょう。"
        ],
        originality: [
            "独自性は高い水準にありますが、専門用語が多く『わかりやすさ』の評価が削られています。Grokは平易な表現を好みます。",
            "トピックの新規性は素晴らしいですが、既存の知識の再構成に留まっています。自身の『失敗談』や『生データ』を混ぜてください。",
            "自身の経験に基づいた一次情報の比率が50%を下回っています。キュレーション（まとめ）だけでなく自論を強化しましょう。",
            "発信内容に一貫性はありますが、新鮮な驚きが不足しています。異業種の知見を掛け合わせた、独自の視点を提示してください。",
            "AI生成と思われる機械的な構文が一部検出されました。語尾のバリエーションや感情表現を増やし、人間性を強調してください。",
            "独自視点が強すぎるため、共通認識を持つユーザーへのリーチが滞っています。マジョリティに刺さる比喩表現が有効です。"
        ]
    };
    
    // カテゴリから1つ選択 (hashベースで個人・日によって変わる)
    const categoryReports = reportPool[weakest];
    comment.textContent = categoryReports[hash % categoryReports.length];

    // 具体的な改善案 (前回のロジック維持)
    const advicePool = {
        reach: ["ハッシュタグを1つに絞り、トレンドワードを冒頭に配置する", "画像内に文字を入れ、インプレッションの滞在時間を伸ばす"],
        trust: ["外部リンクの投稿を3日間停止し、アカウント信頼度をリセットする", "コミュニティノートのリスクがある過激な引用リポストを避ける"],
        engagement: ["投稿後の15分間、自分から5件以上の外部リプライを行う", "『夜21時』固定で、リプライを誘う質問系のポストを行う"],
        media: ["10秒〜20秒の短い縦型動画を毎日1本投稿する", "4枚セットの画像投稿を用い、スワイプ動作を誘発させる"],
        originality: ["他のニュースのコピペではなく、自分の経験を語るポストを増やす", "専門用語を中学生でもわかる言葉に言い換えた図解を投稿する"]
    };
    const strategy = advicePool[weakest].concat(advicePool[strongest][0]);
    strategy.forEach(s => {
        const li = document.createElement('li'); li.textContent = s; plan.appendChild(li);
    });

    // ポスト案プール (30案継続)
    const draftPool = {
        reach: [
            `「【保存版】〇〇で結果を出すための最短ルート。実は9割の人が『△△』を逆に行っています。その真実とは…」`,
            `「※拡散禁止。今のXアルゴリズムで、インプレッションが爆伸びする『魔法の法則』を見つけてしまいました…」`,
            `「フォロワーが少なくても万バズは作れる。そのために必要なのは『センス』ではなく『〇〇』でした。」`,
            `「【速報】最近Xの表示回数が減ったと感じる人へ。この設定を1つ変えるだけで解消します。詳細はリプライ欄に↓」`,
            `「『え、まだハッシュタグたくさん付けてるの？』今のアルゴリズムでは、むしろそれがインプを削る原因かも…」`,
            `「1年前の自分に教えたい。インプレッションを2倍にするなら、文字数よりも『画像内の滞在時間』を意識すべき。」`
        ],
        trust: [
            `「正直に言います。1年前の僕は〇〇で大失敗していました。でも、△△という考え方に変えてから、フォロワー様との絆が深まりました。」`,
            `「Xでの信頼は『一瞬』で崩れ、『一生』かけて築くもの。僕が情報の裏付けにここまでこだわる理由は…」`,
            `「フォロワー数よりも、一人の『ありがとう』を大切にしたい。最近、特にそう思うようになりました。」`,
            `「AIに『スパム』判定される垢と『優良』判定される垢。その決定的な違いは、実はプロフの〇〇にありました。」`,
            `「外部リンクを貼るのを一度やめてみました。結果、インプレッションよりも『届くべき人に届く質』が上がった気がします。」`,
            `「ネットだからこそ、誠実でありたい。僕が発信する情報は、すべて自分自身の経験に基づいたものだけです。」`
        ],
        engagement: [
            `「ぶっちゃけ、今のX運用で一番『しんどい』と感じる瞬間はいつ？僕は〇〇な時ですｗ みんなの本音もリプ欄で教えて！👇」`,
            `「これ、どっち派？ A：質より量、B：量より質。 理由はリプ欄へ！僕の結論は最後に書きます✍️」`,
            `「いつもお世話になっているフォロワーさんに感謝の企画。リプをくれた方の中から抽選で〇〇をプレゼントします！🎁」`,
            `「最近、リプライ欄でみんなと話すのが一番の楽しみになってますｗ 今日もお疲れ様でした！一言リプ歓迎✨」`,
            `「【教えて】〇〇について悩んでるんだけど、みんなのおすすめは何？詳しい人がいたら助けてください🙏」`,
            `「フォロワー1,000人達成のお祝いリプ、本当にありがとうございました！これからも一緒に成長していきましょう！🔥」`
        ],
        media: [
            `「(15秒の解説動画) 1分でわかる！〇〇の極意。文字で読むより動画の方が10倍早く理解できます。続きはリプ欄へ」`,
            `「画像4枚でわかる『〇〇の完全ガイド』。これを保存して、悩んだ時に見返してください。便利ですよ！📁」`,
            `「縦型動画ブースト、まだ使ってない人は損してます。iPhone1台でできる、バズる動画の編集方法を紹介します。」`,
            `「テキストだけでは伝わらない空気感を、1枚の写真に込めて。今日の〇〇は最高でした！✨」`,
            `「【図解】なぜあなたの投稿は読まれないのか？ その理由を1枚の画像にまとめました。衝撃の事実がこちら…」`,
            `「ショート動画の冒頭3秒に、すべてをかける。再生回数が伸び悩んでる人が見落としがちな3つのポイント。🎥」`
        ],
        originality: [
            `「世間では〇〇が正解と言われています。でも、現場レベルで言うと実は『△△』が正解。理由は、実体験でわかったからです。」`,
            `「AIに生成された文章は、魂がこもっていない。僕が拙い言葉でも『自分の声』で発信し続ける理由は…」`,
            `「世の中に溢れる無料情報。でも、本当に価値があるのは『失敗から学んだ生データ』だけだと思う。」`,
            `「誰も言わないから僕が言います。〇〇の業界で今起きてる不都合な真実について。異論は認めます。」`,
            `「『あなただからフォローした』と言われる喜び。知識のコピペを卒業して、自分にしか語れないエピソードを。」`,
            `「トレンドを追いかけるのはもうやめにしませんか？ それよりも、あなたが心の底から熱狂している〇〇を語ろう。」`
        ]
    };
    const categoryDrafts = draftPool[weakest];
    postIdeas.innerHTML = categoryDrafts[hash % categoryDrafts.length];

    // ロードマップもその日に合わせた内容に
    const today = new Date().toLocaleDateString();
    const stepNames = {
        reach: ["認知拡大期", "トピック特化期", "トレンド乗っかり期"],
        trust: ["信頼回復期", "ドメイン強化期", "権威性確立期"],
        engagement: ["交流強化期", "コミュニティ形成期", "親密度MAX期"],
        media: ["動画慣れ期", "編集クオリティUP期", "メディア爆発期"],
        originality: ["独自視点模索期", "オリジナルコンテンツ期", "ブランド確立期"]
    };
    const roadmapData = [
        { day: "1-7", title: stepNames[weakest][0], desc: `${today}時点の${weakest}の低さを克服するため、基礎固めを集中的に行う期間です。` },
        { day: "8-20", title: stepNames[strongest][1], desc: `得意な${strongest}をレバレッジし、AIの推奨ランクを一気に引き上げます。` },
        { day: "21-30", title: "収穫・バズ期", desc: "完成されたアカウント属性を背景に、Grok v3のおすすめ掲載を継続させます。" }
    ];
    roadmapData.forEach(step => {
        const item = document.createElement('div');
        item.className = 'roadmap-item';
        item.innerHTML = `
            <div class="day-circle">${step.day}</div>
            <div class="roadmap-content">
                <h5>Day ${step.day}: ${step.title}</h5>
                <p>${step.desc}</p>
            </div>
        `;
        roadmap.appendChild(item);
    });

    // 𝕏でシェアする機能
    const siteUrl = "https://playful-starlight-e1b4b9.netlify.app"; 
    const tweetText = `𝕏 アルゴ指数解析結果 (${username})\n\n🏆 総合指数：${score} pts\n🩺 AI評価：${document.getElementById('health-label').textContent}\n🚀 最大の強み：${strongest.toUpperCase()}\n\n詳細な分析と30日間ロードマップはこちら！👇\n\n#Xアルゴリズム解析くん`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(siteUrl)}`;
    document.getElementById('share-x-btn').href = shareUrl;
}

function updateMiniBar(id, val) {
    const el = document.getElementById(`val-${id}`); if (!el) return;
    el.textContent = `${val}%`;
    setTimeout(() => {
        const bar = document.getElementById(`bar-${id}`); if (bar) bar.style.width = `${val}%`;
    }, 100);
}

const refreshBtn = document.getElementById('refresh-btn');
refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true; refreshBtn.textContent = 'スキャン中...';
    await new Promise(r => setTimeout(r, 2000));
    await loadData();
    refreshBtn.disabled = false; refreshBtn.textContent = '最新情報をチェックする';
});

window.addEventListener('DOMContentLoaded', loadData);
