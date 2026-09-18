/**
 * Turkish for the documentation page.
 *
 * Kept out of `translations.ts` purely for size: the reference page is forty
 * screens of prose and would have doubled that file. It is merged into the one
 * map at the top of `translations.ts`, so the lookup, the reverse map and the
 * uniqueness rule that goes with it are all unchanged — a Turkish string here
 * still has to be unique across both files.
 *
 * Keys are the English exactly as the page renders it, with whitespace already
 * collapsed the way `translateUiText` collapses it before looking a string up.
 */
export const DOCS_EN_TO_TR: Record<string, string> = {
  // ── Page shell ──────────────────────────────────────────────────────────
  Documentation: 'Dokümantasyon',
  'Documentation — Everspan': 'Dokümantasyon — Everspan',
  'Everything Everspan does, explained.': 'Everspan’ın yaptığı her şey, açıklanmış hâliyle.',
  'Everspan turns a yield-bearing deposit into two tradeable positions: one that pays a fixed amount on a known date, and one that collects the yield until then. This is the reference for how that works, how to use it, and what it does and does not promise.':
    'Everspan, getiri üreten bir mevduatı işlem görebilir iki pozisyona dönüştürür: biri bilinen bir tarihte sabit bir tutar öder, diğeri o tarihe kadar oluşan getiriyi toplar. Bu sayfa bunun nasıl çalıştığının, nasıl kullanıldığının ve neyi vadedip neyi vadetmediğinin referansıdır.',
  'Seven Soroban contracts': 'Yedi Soroban sözleşmesi',
  'Start reading': 'Okumaya başla',
  'On this page': 'Bu sayfada',
  'Documentation sections': 'Dokümantasyon bölümleri',
  Docs: 'Dokümanlar',
  'How Everspan works, end to end': 'Everspan uçtan uca nasıl çalışır',
  'How to use Everspan': 'Everspan nasıl kullanılır',
  Footer: 'Alt bilgi',
  'Address copied': 'Adres kopyalandı',

  // ── Links out of the landing chapters ───────────────────────────────────
  'Read the protocol reference': 'Protokol referansını okuyun',
  'How the rate is priced': 'Oran nasıl fiyatlanır',
  'Read the security model': 'Güvenlik modelini okuyun',

  // ── Table of contents ───────────────────────────────────────────────────
  'What Everspan is': 'Everspan nedir',
  'A fixed-income protocol for Stellar: it separates what a deposit returns from what it earns, and gives each part its own market.':
    'Stellar için bir sabit getiri protokolü: bir mevduatın geri ödediği tutarı kazandığı getiriden ayırır ve her parçaya kendi piyasasını verir.',
  'Standardized Yield, the two positions a deposit becomes, the four operations that move between them, and how yield is accounted for.':
    'Standartlaştırılmış Getiri, bir mevduatın dönüştüğü iki pozisyon, aralarında geçiş sağlayan dört işlem ve getirinin nasıl muhasebeleştirildiği.',
  'Markets and pricing': 'Piyasalar ve fiyatlama',
  'Where a fixed rate actually comes from: one constant-product pool per maturity, and the discount a principal position trades at.':
    'Sabit oranın gerçekte nereden geldiği: her vade için bir sabit çarpan havuzu ve anapara pozisyonunun işlem gördüğü iskonto.',
  'Using the app': 'Uygulamayı kullanmak',
  'From connecting an account to redeeming a matured position, step by step, with what each number on screen means.':
    'Hesap bağlamaktan vadesi dolmuş bir pozisyonu itfa etmeye kadar adım adım, ekrandaki her sayının ne anlama geldiğiyle birlikte.',
  'Who can touch what. The custody model, the complete list of admin powers, and the things Everspan deliberately cannot do.':
    'Kimin neye dokunabildiği. Saklama modeli, yönetici yetkilerinin tam listesi ve Everspan’ın bilerek yapamadığı şeyler.',
  Contracts: 'Sözleşmeler',
  'The seven Soroban crates, what each one is responsible for, and the live Testnet address of every deployed contract.':
    'Yedi Soroban modülü, her birinin neyden sorumlu olduğu ve dağıtılmış her sözleşmenin canlı Testnet adresi.',
  'Errors and troubleshooting': 'Hatalar ve sorun giderme',
  'Every failure the app can show you, what actually caused it, and what to do next.':
    'Uygulamanın gösterebileceği her hata, gerçek nedeni ve sonrasında ne yapılacağı.',
  'The questions that come up most often, answered directly.':
    'En sık sorulan sorular, doğrudan yanıtlarıyla.',
  Glossary: 'Sözlük',
  'Every term this documentation uses, in one place.':
    'Bu dokümantasyonun kullandığı her terim, tek bir yerde.',
  Resources: 'Kaynaklar',
  'Source code, the deep technical documents, the demo, and the upstream projects Everspan builds on.':
    'Kaynak kodu, ayrıntılı teknik belgeler, demo ve Everspan’ın üzerine kurulduğu projeler.',

  // ── 01 · What Everspan is ───────────────────────────────────────────────
  'An asset that earns yield gives you two different things at once: the money you will get back, and the yield it produces while you hold it. Everspan separates them. A deposit becomes two tokens — one that pays a fixed amount at a known date, and one that collects everything the deposit earns until that date.':
    'Getiri kazanan bir varlık size aynı anda iki farklı şey verir: geri alacağınız para ve elinizde tuttuğunuz sürece ürettiği getiri. Everspan bunları ayırır. Bir mevduat iki tokene dönüşür — biri bilinen bir tarihte sabit bir tutar öder, diğeri o tarihe kadar mevduatın kazandığı her şeyi toplar.',
  'Both are ordinary transferable tokens with their own market price, so each side can be held, sold or bought on its own. Somebody who wants certainty buys the first at a discount and redeems it in full at maturity; the discount is their fixed return. Somebody who wants exposure to the rate buys the second, and earns whatever the deposit actually releases.':
    'Her ikisi de kendi piyasa fiyatı olan, transfer edilebilir sıradan tokenlerdir; dolayısıyla her taraf tek başına tutulabilir, satılabilir veya satın alınabilir. Kesinlik isteyen kişi birincisini iskontolu alır ve vadede tamamı karşılığında itfa eder; bu iskonto onun sabit getirisidir. Orana maruz kalmak isteyen kişi ikincisini alır ve mevduatın gerçekte serbest bıraktığı her şeyi kazanır.',
  'Why this exists': 'Bu neden var',
  'Almost all on-chain yield is variable by construction. You deposit, and what you earn is whatever the pool pays next week. That is fine until you need to plan around it — and there is no way to take the opposite side of it either, no way to say “I think this rate is going higher” without also taking on the principal.':
    'Zincir üzerindeki getirilerin neredeyse tamamı yapısı gereği değişkendir. Yatırırsınız ve kazandığınız şey havuzun gelecek hafta ödeyeceği orandır. Buna göre plan yapmanız gerekene kadar sorun değildir — üstelik bunun karşı tarafında yer almanın da bir yolu yoktur; anaparayı da üstlenmeden “bu oran yükselecek” diyebilmenin bir yolu yoktur.',
  'Separating principal from yield makes both trades possible at once, and neither side needs to trust the other. The protocol holds the deposit, and the rules that decide who is owed what run on chain.':
    'Anaparayı getiriden ayırmak her iki işlemi de aynı anda mümkün kılar ve tarafların birbirine güvenmesi gerekmez. Mevduatı protokol tutar, kimin neyi hak ettiğine karar veren kurallar ise zincir üzerinde çalışır.',
  'What you can do with it': 'Bununla neler yapabilirsiniz',
  'Lock a fixed return. Buy a principal position at a discount and redeem it one-for-one at maturity. The rate is fixed the moment you buy.':
    'Sabit getiri kilitleyin. Bir anapara pozisyonunu iskontolu alın ve vadede bire bir itfa edin. Oran, satın aldığınız anda sabitlenir.',
  'Hold yield exposure. Take the yield side of a deposit, with no principal attached, and collect what it releases before maturity.':
    'Getiri maruziyeti tutun. Bir mevduatın kazanç tarafını anaparasız alın ve vadeden önce serbest bıraktığını toplayın.',
  'Earn trading fees. Provide both sides of a pool and take a share of the 0.30% charged on every swap through it.':
    'Takas ücreti kazanın. Bir havuzun her iki tarafını da sağlayın ve içinden geçen her takastan alınan %0,30’un payını alın.',
  'Trade either side at any time. Both positions are transferable tokens, and both have a pool until their maturity passes.':
    'İstediğiniz tarafı istediğiniz zaman işleme sokun. Her iki pozisyon da transfer edilebilir tokendir ve vadeleri geçene kadar her ikisinin de bir havuzu vardır.',
  'Testnet only': 'Yalnızca Testnet',
  'Everspan is deployed on Stellar Testnet and nowhere else. Balances carry no monetary value, the network is reset periodically by the SDF, and there is no mainnet configuration in the codebase. Treat everything here as a working demonstration of the mechanism, not as a place to put money.':
    'Everspan yalnızca Stellar Testnet üzerinde dağıtılmıştır, başka hiçbir ağda değil. Bakiyelerin parasal değeri yoktur, ağ SDF tarafından belirli aralıklarla sıfırlanır ve kod tabanında ana ağ yapılandırması bulunmaz. Buradaki her şeyi mekanizmanın çalışan bir gösterimi olarak görün, para koyulacak bir yer olarak değil.',

  // ── 02 · The protocol ───────────────────────────────────────────────────
  'Standardized Yield': 'Standartlaştırılmış Getiri',
  'Every yield source enters Everspan through one interface, called Standardized Yield. A vault takes the underlying asset and exposes a single exchange rate that can only ever go up. Everything above the vault — the split, the settlement, the market — is written against that one rate and does not know or care where the yield came from.':
    'Her getiri kaynağı Everspan’a Standartlaştırılmış Getiri adı verilen tek bir arayüzden girer. Bir kasa dayanak varlığı alır ve yalnızca yukarı yönlü hareket edebilen tek bir döviz kuru yayımlar. Kasanın üzerindeki her şey — ayırma, uzlaşma, piyasa — o tek orana göre yazılmıştır ve getirinin nereden geldiğini ne bilir ne de umursar.',
  'You will rarely see this in the app. You deposit the asset you already hold, and when a wrap is needed Everspan shows it as an explicit Prepare step with its own approval, rather than hiding an extra token in the middle of your balance.':
    'Bunu uygulamada nadiren görürsünüz. Elinizde zaten bulunan varlığı yatırırsınız; bir sarmalama gerektiğinde Everspan bunu bakiyenizin ortasına fazladan bir token saklamak yerine kendi onayı olan açık bir Hazırla adımı olarak gösterir.',
  'Principal and Yield': 'Anapara ve Kazanç',
  'Splitting one unit of Standardized Yield at a maturity mints exactly one Principal token and one Yield token for that maturity. Both are real SEP-41 tokens, deployed by the protocol as a fresh pair per maturity, and both can be sent to anyone.':
    'Bir vadede bir birim Standartlaştırılmış Getiriyi ayırmak, o vade için tam olarak bir Anapara tokeni ve bir Kazanç tokeni basar. Her ikisi de gerçek SEP-41 tokenleridir, protokol tarafından her vade için yeni bir çift olarak dağıtılır ve her ikisi de herkese gönderilebilir.',
  'What each position pays': 'Her pozisyonun ödediği',
  Position: 'Pozisyon',
  'What it pays': 'Ne öder',
  'At maturity': 'Vadede',
  'Nothing until maturity. Its value is what it redeems for.':
    'Vadeye kadar hiçbir şey. Değeri, itfa edildiğinde alacağı tutardır.',
  'Redeems for the full underlying amount, one for one.':
    'Dayanak varlığın tamamı karşılığında, bire bir itfa edilir.',
  'Everything the deposit releases, claimable as it accrues.':
    'Mevduatın serbest bıraktığı her şey; biriktikçe talep edilebilir.',
  'Stops accruing at the maturity timestamp, exactly.':
    'Vade zaman damgasında, tam olarak orada birikmeyi durdurur.',
  'Before maturity the two supplies are always equal: every Principal token that exists has a Yield token somewhere that was minted with it. After maturity that stops being true by design, because redeeming burns Principal while the matured Yield side simply goes inert.':
    'Vadeden önce iki arz daima eşittir: var olan her Anapara tokeninin, onunla birlikte basılmış bir Kazanç tokeni bir yerdedir. Vadeden sonra bu tasarım gereği geçerliliğini yitirir; çünkü itfa Anaparayı yakarken vadesi dolmuş Kazanç tarafı yalnızca atıl hâle gelir.',
  'The four operations': 'Dört işlem',
  Split: 'Ayır',
  'Hand the protocol standardized yield and receive equal amounts of Principal and Yield for one maturity.':
    'Protokole standartlaştırılmış getiri verin ve tek bir vade için eşit miktarda Anapara ve Kazanç alın.',
  Merge: 'Birleştir',
  'The reverse: return equal amounts of both before maturity and get the deposit back. A split followed immediately by a merge returns the same amount, minus at most two stroops of rounding.':
    'Tersi: vadeden önce her ikisinden de eşit miktarda geri verin ve mevduatı geri alın. Bir ayırmanın hemen ardından yapılan birleştirme aynı tutarı, yuvarlamadan kaynaklanan en fazla iki stroop eksiğiyle geri döndürür.',
  'Pay out the yield a Yield position has accrued so far, without giving up the position.':
    'Bir Kazanç pozisyonunun o ana kadar biriktirdiği getiriyi, pozisyondan vazgeçmeden ödeyin.',
  Redeem: 'İtfa et',
  'After maturity, burn Principal and receive the underlying at the rate frozen at the maturity timestamp.':
    'Vadeden sonra Anaparayı yakın ve dayanak varlığı, vade zaman damgasında dondurulmuş orandan alın.',
  'How yield is accounted for': 'Getiri nasıl muhasebeleştirilir',
  'Because a Yield token can be transferred, the protocol cannot simply divide the total yield by the number of holders at the end. It tracks a settlement index per holder: the exchange rate the last time that holder was settled. Settling at a current rate credits the difference and moves the index up to it.':
    'Bir Kazanç tokeni transfer edilebildiği için protokol, toplam getiriyi sonunda basitçe sahip sayısına bölemez. Sahip başına bir uzlaşma endeksi tutar: o sahibin en son uzlaştığı andaki döviz kuru. Güncel bir oranda uzlaşmak aradaki farkı alacak kaydeder ve endeksi o orana yükseltir.',
  'S is the stroop scale, index is the holder’s last settlement rate, and R is the rate now — frozen at the maturity rate once maturity has passed. The result is clamped at zero.':
    'S stroop ölçeğidir, index sahibin son uzlaşma oranıdır, R ise şu anki orandır — vade geçtikten sonra vade oranında dondurulur. Sonuç sıfırın altına inemez.',
  'Every user-initiated change to a Yield balance settles both parties first, using the balances as they were before the change. The sender keeps everything accrued up to that instant and the receiver starts earning from it, so a transfer can never move somebody else’s accrued yield along with the token.':
    'Bir Kazanç bakiyesinde kullanıcının başlattığı her değişiklik, önce değişiklikten önceki bakiyeleri kullanarak iki tarafı da uzlaştırır. Gönderen o ana kadar birikmiş olan her şeyi elinde tutar, alıcı ise o andan itibaren kazanmaya başlar; böylece bir transfer, tokenle birlikte bir başkasının birikmiş getirisini asla taşıyamaz.',
  'Rounding and solvency': 'Yuvarlama ve ödeme gücü',
  'One rule governs every amount in the protocol: anything that leaves is rounded down, anything reserved against a liability is rounded up. The consequence is that the balance the contract holds is always at least the sum of everything it owes, so there is never dust that somebody could mint out of the rounding.':
    'Protokoldeki her tutarı tek bir kural yönetir: dışarı çıkan her şey aşağı, bir yükümlülüğe karşılık ayrılan her şey yukarı yuvarlanır. Sonuç olarak sözleşmenin tuttuğu bakiye daima borçlu olduğu her şeyin toplamına eşit ya da ondan fazladır; dolayısıyla yuvarlamadan basılabilecek bir artık asla oluşmaz.',
  'Principal supply equals Yield supply for a maturity, through every pre-maturity operation.':
    'Bir vade için Anapara arzı, vade öncesi her işlem boyunca Kazanç arzına eşittir.',
  'Split then merge returns the deposit minus at most two stroops — one floor in each direction.':
    'Ayırıp ardından birleştirmek mevduatı en fazla iki stroop eksiğiyle geri verir — her yönde bir aşağı yuvarlama.',
  'Yield stops accruing exactly at the maturity timestamp, and Principal then redeems at the rate frozen there.':
    'Kazanç tam olarak vade zaman damgasında birikmeyi durdurur, Anapara ise o noktada dondurulan orandan itfa edilir.',
  'A scripted lifecycle test asserts solvency after every single operation, on both yield sources.':
    'Betikli bir yaşam döngüsü testi, her iki getiri kaynağında da her tek işlemin ardından ödeme gücünü doğrular.',

  // ── 03 · Markets and pricing ────────────────────────────────────────────
  'Splitting a deposit creates the two positions, but it does not price them. That happens in the market: one constant-product pool per maturity, holding Principal on one side and the deposit on the other, with a fixed 0.30% fee on every swap that goes to the people providing the liquidity.':
    'Bir mevduatı ayırmak iki pozisyonu oluşturur ama onları fiyatlamaz. Fiyatlama piyasada olur: her vade için bir tarafında Anapara, diğer tarafında mevduat bulunan tek bir sabit çarpan havuzu ve her takasta likiditeyi sağlayanlara giden sabit %0,30 ücret.',
  'Where the fixed rate comes from': 'Sabit oran nereden gelir',
  'A principal position redeems for a full unit at maturity, so before maturity it trades below one. That discount is the whole trade. Pay less than a unit now, receive a full unit later, and the gap between the two — annualized over the time left — is the rate you have locked.':
    'Bir anapara pozisyonu vadede tam bir birim karşılığında itfa edilir; bu yüzden vadeden önce birin altında işlem görür. İşlemin tamamı bu iskontodur. Şimdi bir birimden az ödersiniz, sonra tam bir birim alırsınız ve ikisi arasındaki fark — kalan süreye göre yıllıklandırıldığında — kilitlediğiniz orandır.',
  /* The formula is notation, but two of its terms are English words, and the
     caption names one of them — so the pair has to move together. */
  'APY = (1 / cost) ^ (365 days / time to maturity) − 1':
    'APY = (1 / maliyet) ^ (365 gün / vadeye kalan süre) − 1',
  'cost is what one unit of principal costs today, in the deposit asset.':
    'maliyet, bir birim anaparanın bugün mevduat varlığı cinsinden değeridir.',
  'Paying 0.958 for a principal position that matures in 90 days locks roughly 19% annualized — and it is locked, because nothing after the purchase changes what the position redeems for. The rate the app shows you before you confirm is the rate that trade produces, including its price impact and fee.':
    '90 günde vadesi dolan bir anapara pozisyonu için 0,958 ödemek yıllık yaklaşık %19’u kilitler — ve gerçekten kilitlidir, çünkü satın alma sonrasında hiçbir şey pozisyonun itfa değerini değiştirmez. Uygulamanın onaydan önce gösterdiği oran, fiyat etkisi ve ücreti dâhil olmak üzere o işlemin ürettiği orandır.',
  'Providing liquidity': 'Likidite sağlamak',
  'A pool needs both sides. Adding liquidity deposits Principal and the deposit asset together and mints pool shares in proportion; burning those shares later returns a pro-rata slice of whatever the pool holds at that moment, fees included.':
    'Bir havuzun her iki tarafa da ihtiyacı vardır. Likidite eklemek Anapara ile mevduat varlığını birlikte yatırır ve orantılı havuz payları basar; bu payları daha sonra yakmak, ücretler dâhil olmak üzere havuzun o andaki içeriğinden orantılı bir dilim geri verir.',
  'The usual warning about impermanent loss applies, with one difference worth knowing: a principal position converges to exactly one unit as its maturity approaches, so the price a pool is exposed to does not wander indefinitely — it walks towards a known endpoint.':
    'Geçici kayıp konusundaki bilinen uyarı burada da geçerlidir, ama bilinmeye değer bir farkla: bir anapara pozisyonu vadesi yaklaştıkça tam olarak bir birime yakınsar; dolayısıyla havuzun maruz kaldığı fiyat sonsuza kadar savrulmaz — bilinen bir varış noktasına doğru yürür.',
  'The two yield sources': 'İki getiri kaynağı',
  'Everspan ships two entirely separate deployments, switchable in the app. They share no balances and no contracts; only the token code is common. One exists to be predictable, the other to prove the mechanism works on yield nobody controls.':
    'Everspan, uygulama içinden geçiş yapılabilen tamamen ayrı iki dağıtımla gelir. Ne bakiye ne de sözleşme paylaşırlar; yalnızca token kodu ortaktır. Biri öngörülebilir olmak için vardır, diğeri mekanizmanın kimsenin kontrol etmediği bir getiri üzerinde de çalıştığını kanıtlamak için.',
  'The two markets': 'İki piyasa',
  'A demo token whose rate grows about 5% a year by ledger time':
    'Oranı defter zamanına göre yılda yaklaşık %5 büyüyen bir demo token',
  'A live Blend v2 lending pool on Testnet':
    'Testnet üzerinde canlı bir Blend v2 borç verme havuzu',
  'Deposit shares': 'Mevduat payları',
  'Wrapped one for one with the underlying': 'Dayanak varlıkla bire bir sarmalanır',
  'Interest-bearing shares, so a wrap mints fewer units than you put in':
    'Faiz getiren paylar; dolayısıyla sarmalama yatırdığınızdan daha az birim basar',
  'Getting the asset': 'Varlığı edinmek',
  'A public faucet on the token itself': 'Tokenin kendisinde herkese açık bir musluk',
  'Friendbot — the underlying here is plain XLM': 'Friendbot — buradaki dayanak varlık düz XLM’dir',
  'Why it exists': 'Neden var',
  'A deterministic baseline for tests and demos': 'Testler ve demolar için belirlenimci bir taban',
  'Proof the same mechanics run over real, external yield':
    'Aynı mekaniğin gerçek, dış bir getiri üzerinde de çalıştığının kanıtı',
  'Exit can genuinely fail on Blend': 'Blend’de çıkış gerçekten başarısız olabilir',
  'A lending pool that is fully borrowed has nothing free to pay a withdrawal. When that happens Everspan surfaces Blend’s own error rather than a generic failure, so you are told the pool has no free liquidity right now instead of being left guessing. The position is untouched; the withdrawal can be retried once utilisation drops.':
    'Tamamı ödünç verilmiş bir borç verme havuzunda çekimi karşılayacak boşta varlık kalmaz. Bu durumda Everspan genel bir hata yerine Blend’in kendi hatasını gösterir; böylece tahminde bulunmak zorunda kalmaz, havuzun şu anda boşta likiditesi olmadığını öğrenirsiniz. Pozisyona dokunulmaz; kullanım oranı düştüğünde çekim yeniden denenebilir.',

  // ── 04 · Using the app ──────────────────────────────────────────────────
  'Get an account': 'Bir hesap edinin',
  'Connect a Testnet wallet — Freighter, xBull, LOBSTR or Albedo — or use the passkey entry, which creates a Testnet account on the device you are holding. Signing always happens in the wallet; Everspan never sees a secret key.':
    'Bir Testnet cüzdanı bağlayın — Freighter, xBull, LOBSTR veya Albedo — ya da elinizdeki cihazda bir Testnet hesabı oluşturan geçiş anahtarı girişini kullanın. İmzalama daima cüzdanın içinde gerçekleşir; Everspan gizli anahtarı asla görmez.',
  'Fund it': 'Bakiye yükleyin',
  'On the mUSDY market, the faucet under your balance mints 1,000 mUSDY. On the Blend market the underlying is plain XLM, so Friendbot funds the account instead.':
    'mUSDY piyasasında bakiyenizin altındaki musluk 1.000 mUSDY basar. Blend piyasasında dayanak varlık düz XLM olduğu için hesabı Friendbot fonlar.',
  'Pick an outcome, not a mechanism': 'Mekanizmayı değil, sonucu seçin',
  'Positions open from three plain-language choices: a fixed return, exposure to the yield, or trading fees. Everspan works out which contract calls that takes.':
    'Pozisyonlar sade dille üç seçenekten açılır: sabit getiri, getiriye maruz kalma veya takas ücretleri. Bunun hangi sözleşme çağrılarını gerektirdiğini Everspan hesaplar.',
  'Lock a fixed return': 'Sabit getiri kilitleyin',
  'Enter an amount in the asset you actually hold. If your wallet needs a prepared balance first, Everspan shows an explicit Prepare step before the lock, each with its own approval. The panel states the locked rate, the price impact and the minimum you will receive before you sign anything.':
    'Elinizde gerçekten bulunan varlık cinsinden bir tutar girin. Cüzdanınızın önce hazırlanmış bir bakiyeye ihtiyacı varsa Everspan kilitten önce açık bir Hazırla adımı gösterir; her adımın kendi onayı olur. Panel, siz herhangi bir şey imzalamadan önce kilitlenen oranı, fiyat etkisini ve alacağınız asgari tutarı belirtir.',
  'Or take yield exposure': 'Ya da getiri maruziyeti alın',
  'Everspan separates the deposit and sells the principal side straight back to the pool, leaving you holding only the yield. It is a staged flow, one approval per step, and every step is named before it runs.':
    'Everspan mevduatı ayırır ve anapara tarafını doğrudan havuza geri satar; elinizde yalnızca kazanç kalır. Bu, her adımı bir onay gerektiren aşamalı bir akıştır ve her adım çalışmadan önce adıyla belirtilir.',
  'Watch it accrue, then claim': 'Birikmesini izleyin, sonra talep edin',
  'Positions shows claimable yield ticking up live between polls. Claim pays it out without closing the position; after maturity, Redeem burns the principal side and returns the underlying.':
    'Pozisyonlar sekmesi, talep edilebilir getirinin sorgular arasında canlı olarak arttığını gösterir. Talep et, pozisyonu kapatmadan bunu öder; vadeden sonra İtfa et anapara tarafını yakar ve dayanak varlığı geri verir.',
  'Check the record': 'Kaydı kontrol edin',
  'Activity streams every event from every contract in the market as it is confirmed, yours or anyone else’s, with a link to each transaction on the explorer.':
    'Etkinlik, piyasadaki her sözleşmeden gelen her olayı onaylandığı anda akıtır — sizin ya da bir başkasının — ve her işlem için gezginde bir bağlantı verir.',
  'Reading the numbers': 'Sayıları okumak',
  'What buying principal at the current pool price locks in, annualized to maturity. This is the rate you are actually trading at.':
    'Güncel havuz fiyatından anapara almanın kilitlediği, vadeye göre yıllıklandırılmış oran. Gerçekte işlem yaptığınız oran budur.',
  'What the deposit itself is earning right now. It moves; the fixed rate does not.':
    'Mevduatın kendisinin şu anda kazandığı oran. Bu oran hareket eder; sabit oran etmez.',
  'How far your own trade moves the pool price. A large trade against a thin pool gets a worse rate, and this is where that shows.':
    'Kendi işleminizin havuz fiyatını ne kadar hareket ettirdiği. Sığ bir havuza karşı yapılan büyük bir işlem daha kötü bir oran alır ve bu, kendini burada gösterir.',
  'Underlying APY': 'Dayanak APY',
  'Minimum received': 'Alınacak asgari tutar',
  'The floor your transaction will accept, derived from your slippage setting. Below it the transaction fails rather than filling at a worse price.':
    'İşleminizin kabul edeceği alt sınır; kayma ayarınızdan türetilir. Bunun altında işlem, daha kötü bir fiyattan gerçekleşmek yerine başarısız olur.',
  'Yield already earned and waiting. It is projected between polls, so it moves continuously rather than in steps.':
    'Kazanılmış ve bekleyen getiri. Sorgular arasında öngörülür, bu yüzden adım adım değil sürekli hareket eder.',
  'Account has a switch that reveals the raw mechanics: wrapping the underlying, splitting it by hand, merging it back. Nothing there is required — the ordinary flows do all of it — but every intermediate step is available to anyone who wants to drive the protocol directly.':
    'Hesap sekmesinde ham mekaniği açığa çıkaran bir anahtar vardır: dayanak varlığı sarmalamak, elle ayırmak, geri birleştirmek. Oradaki hiçbir şey zorunlu değildir — olağan akışlar bunların hepsini yapar — ama protokolü doğrudan sürmek isteyen herkes için her ara adım oradadır.',

  // ── 05 · Security ───────────────────────────────────────────────────────
  Custody: 'Saklama',
  'Everspan is self-custodial in the literal sense: there is no account on the protocol’s side that holds your assets for you. Your key stays in your wallet, every transaction is built in your browser and signed by you, and the app never requests, stores or logs a secret.':
    'Everspan kelimenin tam anlamıyla kendi saklamanızdadır: protokol tarafında varlıklarınızı sizin adınıza tutan bir hesap yoktur. Anahtarınız cüzdanınızda kalır, her işlem tarayıcınızda oluşturulup sizin tarafınızdan imzalanır ve uygulama hiçbir zaman bir gizli bilgi istemez, saklamaz veya günlüğe yazmaz.',
  'Every function that pays out — withdraw, unwrap, merge, claim, redeem — pays the caller that authorized the call, from that caller’s own recorded balance. There is no argument for “pay someone else” to get wrong.':
    'Ödeme yapan her fonksiyon — çekme, sarmalamayı çözme, birleştirme, talep, itfa — çağrıyı yetkilendiren çağıranın kendi kayıtlı bakiyesinden yine o çağırana öder. Yanlış girilebilecek bir “başkasına öde” parametresi yoktur.',
  'Admin powers, in full': 'Yönetici yetkilerinin tamamı',
  'Four entry points in the entire workspace are admin-gated, and none of them can move a user’s funds: minting and setting the rate on the demo token, creating a maturity, and creating a pool. The two vaults that actually hold deposits have no admin entry point at all.':
    'Tüm çalışma alanında yalnızca dört giriş noktası yönetici korumalıdır ve hiçbiri bir kullanıcının varlıklarını hareket ettiremez: demo tokende basım ve oran belirleme, bir vade oluşturma ve bir havuz oluşturma. Mevduatları gerçekten tutan iki kasanın ise hiç yönetici giriş noktası yoktur.',
  'No upgrade path. An upgrade key is a backdoor with a friendly name, so the contracts do not have one.':
    'Yükseltme yolu yok. Yükseltme anahtarı, dostane bir adı olan arka kapıdır; bu yüzden sözleşmelerde böyle bir şey bulunmaz.',
  'No pause switch and no admin rotation anywhere in the workspace.':
    'Çalışma alanının hiçbir yerinde duraklatma anahtarı ya da yönetici değiştirme yok.',
  'The cost of that is stated plainly: a bug cannot be patched in place, and a lost admin key stops new maturities and pools being created.':
    'Bunun bedeli açıkça yazılıdır: bir hata yerinde yamalanamaz ve kaybedilen bir yönetici anahtarı yeni vade ve havuz oluşturulmasını durdurur.',
  'What it buys: even then, every existing holder can still claim, redeem and exit, because none of those paths consult an admin.':
    'Karşılığında aldığı şey şudur: o durumda bile mevcut her sahip talep edebilir, itfa edebilir ve çıkabilir; çünkü bu yolların hiçbiri bir yöneticiye danışmaz.',
  'What Everspan cannot do for you': 'Everspan’ın sizin için yapamayacakları',
  'Reverse a signed transaction. Once it is confirmed on the ledger it is final.':
    'İmzalanmış bir işlemi geri almak. Defterde onaylandıktan sonra kesindir.',
  'Recover a lost key or passkey. Nobody holds a copy, including us.':
    'Kaybolan bir anahtarı veya geçiş anahtarını kurtarmak. Biz dâhil kimsede bir kopyası yoktur.',
  'Guarantee an exit from a fully utilized lending pool. That is the pool’s liquidity, not the protocol’s.':
    'Tamamı kullanımda olan bir borç verme havuzundan çıkışı garanti etmek. Bu, protokolün değil havuzun likiditesidir.',
  'Survive a Testnet reset. When the SDF resets the network, deployed contracts and balances go with it.':
    'Bir Testnet sıfırlamasından sağ çıkmak. SDF ağı sıfırladığında dağıtılmış sözleşmeler ve bakiyeler de onunla gider.',
  'Habits worth keeping': 'Edinmeye değer alışkanlıklar',
  'Never type a secret key or recovery phrase into any website, including this one. Everspan has no field that asks for one.':
    'Bu site dâhil hiçbir web sitesine gizli anahtar ya da kurtarma ifadesi yazmayın. Everspan’da bunu isteyen bir alan yoktur.',
  'Check the domain before you approve a signature, and check that the contract id in the request matches the one published below.':
    'Bir imzayı onaylamadan önce alan adını kontrol edin ve istekteki sözleşme kimliğinin aşağıda yayımlananla eşleştiğini doğrulayın.',
  'Read what the wallet is asking you to sign. Everspan names each step before it runs, so the two should agree.':
    'Cüzdanın imzalamanızı istediği şeyi okuyun. Everspan her adımı çalışmadan önce adıyla belirtir; dolayısıyla ikisi birbirini tutmalıdır.',
  'Keep the network on Testnet. The app blocks writes and shows a banner if the wallet is pointed elsewhere.':
    'Ağı Testnet’te tutun. Cüzdan başka bir ağa yönlendirilmişse uygulama yazma işlemlerini engeller ve bir uyarı şeridi gösterir.',
  Review: 'İnceleme',
  'The contracts have been through two rounds of adversarial review, with the findings and the storage and time-to-live audit written up in the repository, alongside a threat model covering assets, actors, trust boundaries and failure modes.':
    'Sözleşmeler iki tur düşmanca incelemeden geçti; bulgular ile depolama ve yaşam süresi denetimi, varlıkları, aktörleri, güven sınırlarını ve hata biçimlerini kapsayan bir tehdit modeliyle birlikte depoda yazılı hâlde duruyor.',
  'Threat model': 'Tehdit modeli',
  'Adversarial audit, round two': 'Düşmanca denetim, ikinci tur',
  'The test suites, per crate': 'Modül modül test paketleri',

  // ── 06 · Contracts ──────────────────────────────────────────────────────
  'The seven contract crates': 'Yedi sözleşme modülü',
  Contract: 'Sözleşme',
  Responsibility: 'Sorumluluk',
  'The demo yield-bearing token. Its rate grows with ledger time and is checkpointed, so any past rate can be recovered exactly. Carries a public faucet.':
    'Getiri üreten demo token. Oranı defter zamanıyla büyür ve kontrol noktalarına yazılır; böylece geçmişteki herhangi bir oran birebir geri elde edilebilir. Herkese açık bir musluk taşır.',
  'Wraps the demo token into standardized yield, one for one. The result is itself a full SEP-41 token.':
    'Demo tokeni bire bir standartlaştırılmış getiriye sarmalar. Sonuç, kendisi de tam bir SEP-41 tokenidir.',
  'The same interface over a real Blend v2 lending position, with a ratchet that keeps the rate from moving backwards and a recoverable past for settlement.':
    'Gerçek bir Blend v2 borç verme pozisyonu üzerinde aynı arayüz; oranın geriye gitmesini engelleyen bir kilit dişlisi ve uzlaşma için geri elde edilebilir bir geçmiş ile birlikte.',
  'The market for one maturity: split, merge, claim and redeem, plus the factory call that deploys a maturity’s token pair.':
    'Tek bir vadenin piyasası: ayır, birleştir, talep et ve itfa et; ayrıca bir vadenin token çiftini dağıtan fabrika çağrısı.',
  'The two positions, as transferable SEP-41 tokens minted only by the market. The yield side carries the settlement hook.':
    'İki pozisyon, yalnızca piyasa tarafından basılan transfer edilebilir SEP-41 tokenleri olarak. Kazanç tarafı uzlaşma kancasını taşır.',
  'Constant-product pools, one per maturity, with a 30 basis point fee. Where the fixed rate is actually priced.':
    'Her vade için bir tane olmak üzere, 30 baz puan ücretli sabit çarpan havuzları. Sabit oranın gerçekte fiyatlandığı yer.',
  'mUSDY market': 'mUSDY piyasası',
  'Mock yield token (demo, ~5% APY)': 'Sahte getiri tokeni (demo, ~%5 APY)',
  'Blend lending pool (real Testnet yield)': 'Blend borç verme havuzu (gerçek Testnet getirisi)',
  'XLM · Blend market': 'XLM · Blend piyasası',
  Underlying: 'Dayanak varlık',
  'Deposit vault': 'Mevduat kasası',
  'Wraps the underlying into standardized yield':
    'Dayanak varlığı standartlaştırılmış getiriye sarmalar',
  'Market contract': 'Piyasa sözleşmesi',
  'Split, merge, claim, redeem': 'Ayır, birleştir, talep et, itfa et',
  Pools: 'Havuzlar',
  'Constant-product principal pools': 'Sabit çarpan anapara havuzları',
  'Per-maturity tokens': 'Vade başına tokenler',
  'The Principal and Yield token addresses are not fixed: the market deploys a fresh pair when a maturity is created. Read them from the market with a call to get_market for that maturity, or from the MaturityCreated event the deployment emitted.':
    'Anapara ve Kazanç token adresleri sabit değildir: bir vade oluşturulduğunda piyasa yeni bir çift dağıtır. Bunları o vade için get_market çağrısıyla piyasadan ya da dağıtımın yaydığı MaturityCreated olayından okuyun.',
  'Testnet is reset periodically. If an address above no longer resolves, the deployment scripts in the repository redeploy everything in dependency order and print the new ids.':
    'Testnet belirli aralıklarla sıfırlanır. Yukarıdaki bir adres artık çözümlenmiyorsa depodaki dağıtım betikleri her şeyi bağımlılık sırasına göre yeniden dağıtır ve yeni kimlikleri yazdırır.',

  // ── 07 · Errors and troubleshooting ─────────────────────────────────────
  'Nothing is reported as a generic failure. Every contract error is mapped to the thing that actually went wrong, and a problem reaching the network is named as that rather than as a failed transaction — because a transaction that never left is very different from one that was rejected.':
    'Hiçbir şey genel bir hata olarak bildirilmez. Her sözleşme hatası gerçekte ters giden şeye eşlenir ve ağa ulaşma sorunu başarısız bir işlem olarak değil, olduğu gibi adlandırılır — çünkü hiç gönderilmemiş bir işlem, reddedilmiş bir işlemden çok farklıdır.',
  'What each failure means': 'Her hatanın anlamı',
  'What you see': 'Gördüğünüz',
  'What it means': 'Anlamı',
  'What to do': 'Ne yapmalı',
  'The wallet is not offered': 'Cüzdan seçenekler arasında yok',
  'Insufficient balance': 'Yetersiz bakiye',
  'That wallet is not installed, or cannot exist in this browser — an extension has no place on a phone.':
    'O cüzdan kurulu değildir ya da bu tarayıcıda bulunamaz — bir uzantının telefonda yeri yoktur.',
  'Install it, or use a wallet that works over WalletConnect, or use the passkey entry.':
    'Kurun, WalletConnect üzerinden çalışan bir cüzdan kullanın ya da geçiş anahtarı girişini tercih edin.',
  'Nothing happens after approval': 'Onaydan sonra bir şey olmuyor',
  'The signature was declined in the wallet. The action returns to idle on purpose.':
    'İmza cüzdanda reddedildi. İşlem bilerek boşta duruma döner.',
  'Run it again and approve, if that was not deliberate.':
    'Bu bilinçli değilse yeniden çalıştırın ve onaylayın.',
  'The amount is larger than the balance the form can spend.':
    'Tutar, formun harcayabileceği bakiyeden büyük.',
  'Lower the amount, or use the faucet on the mUSDY market.':
    'Tutarı düşürün ya da mUSDY piyasasındaki musluğu kullanın.',
  'The wallet is pointed at a network other than Testnet. Writes are blocked while it is.':
    'Cüzdan Testnet dışında bir ağa yönlendirilmiş. Bu sürdükçe yazma işlemleri engellenir.',
  'Switch the wallet to Testnet; the banner clears by itself.':
    'Cüzdanı Testnet’e geçirin; uyarı şeridi kendiliğinden kalkar.',
  'Connection problem': 'Bağlantı sorunu',
  'The RPC endpoint could not be reached. The transaction may never have been sent.':
    'RPC uç noktasına ulaşılamadı. İşlem hiç gönderilmemiş olabilir.',
  'Retry. Check Activity before resending, so you do not sign the same thing twice.':
    'Yeniden deneyin. Aynı şeyi iki kez imzalamamak için yeniden göndermeden önce Etkinlik sekmesine bakın.',
  'The Blend pool has no free liquidity': 'Blend havuzunda boşta likidite yok',
  'The lending reserve is fully utilized and cannot pay a withdrawal right now.':
    'Borç verme rezervi tamamen kullanımda ve şu anda bir çekimi karşılayamıyor.',
  'Wait for utilisation to drop and retry. The position is unaffected.':
    'Kullanım oranının düşmesini bekleyip yeniden deneyin. Pozisyon etkilenmez.',
  'Maturity passed, or not reached': 'Vade geçti ya da henüz gelmedi',
  'The operation is only valid on the other side of the maturity timestamp.':
    'Bu işlem yalnızca vade zaman damgasının diğer tarafında geçerlidir.',
  'Redeem after maturity; split, merge and claim before it.':
    'İtfayı vadeden sonra; ayırma, birleştirme ve talebi vadeden önce yapın.',
  'Nothing to claim': 'Talep edilecek bir şey yok',
  'The position has no yield accrued since its last settlement.':
    'Pozisyonun son uzlaşmasından bu yana birikmiş getirisi yok.',
  'Nothing to do — a transfer or an earlier claim already settled it.':
    'Yapılacak bir şey yok — bir transfer ya da daha önceki bir talep zaten uzlaştırmış.',
  'If an account looks empty': 'Bir hesap boş görünüyorsa',
  'An unfunded Testnet account does not exist on the ledger yet, so a balance lookup returns nothing rather than zero. Fund it with Friendbot and the balance appears. If it still looks empty afterwards, check the market switch at the top of the app: each market is a separate deployment with separate balances.':
    'Fonlanmamış bir Testnet hesabı defterde henüz var olmadığı için bakiye sorgusu sıfır değil, hiçbir şey döndürür. Friendbot ile fonlayın, bakiye görünür. Sonrasında da boş görünüyorsa uygulamanın üstündeki piyasa anahtarını kontrol edin: her piyasa, kendi bakiyeleri olan ayrı bir dağıtımdır.',

  // ── 08 · FAQ ────────────────────────────────────────────────────────────
  'Is my fixed rate really fixed?': 'Sabit oranım gerçekten sabit mi?',
  'Yes, once the trade is done. A principal position redeems for a full unit at maturity no matter what happens to the underlying rate afterwards, so the discount you bought at is your return. What is not fixed is the price of the position if you sell it before maturity.':
    'İşlem tamamlandıktan sonra evet. Bir anapara pozisyonu, sonrasında dayanak orana ne olursa olsun vadede tam bir birim karşılığında itfa edilir; dolayısıyla aldığınız iskonto sizin getirinizdir. Sabit olmayan şey, pozisyonu vadeden önce satmanız hâlindeki fiyatıdır.',
  'What happens if I do nothing until maturity?': 'Vadeye kadar hiçbir şey yapmazsam ne olur?',
  'Principal becomes redeemable for the full underlying amount, and the yield side stops accruing at that timestamp. Neither expires, and neither is lost — both wait for you.':
    'Anapara, dayanak varlığın tamamı karşılığında itfa edilebilir hâle gelir ve kazanç tarafı o zaman damgasında birikmeyi durdurur. Hiçbiri sona ermez, hiçbiri kaybolmaz — ikisi de sizi bekler.',
  'Can I get out early?': 'Erken çıkabilir miyim?',
  'Yes. Both positions are transferable tokens with a pool until maturity, so either can be sold back at the market price. Holding both sides also lets you merge them back into the deposit directly.':
    'Evet. Her iki pozisyon da vadeye kadar bir havuzu olan transfer edilebilir tokenlerdir; dolayısıyla ikisi de piyasa fiyatından geri satılabilir. Her iki tarafı da elinizde tutmak, onları doğrudan mevduata geri birleştirmenize de olanak tanır.',
  'Where does the yield actually come from?': 'Getiri gerçekte nereden geliyor?',
  'On the mUSDY market, from a demo token whose rate grows with ledger time — nothing is being generated, it is a controlled baseline. On the Blend market it is a real lending position in a Blend v2 pool on Testnet, and the yield is whatever that pool pays.':
    'mUSDY piyasasında, oranı defter zamanıyla büyüyen bir demo tokenden — hiçbir şey üretilmiyor, bu kontrollü bir taban. Blend piyasasında ise Testnet üzerindeki bir Blend v2 havuzunda gerçek bir borç verme pozisyonu var ve getiri, o havuzun ödediği neyse odur.',
  'Do I need a browser extension?': 'Tarayıcı uzantısına ihtiyacım var mı?',
  'No. The passkey entry creates a Testnet account with the device you are holding, which is what makes the app usable on a phone. Extension wallets remain fully supported on the desktop.':
    'Hayır. Geçiş anahtarı girişi, elinizdeki cihazla bir Testnet hesabı oluşturur; uygulamayı telefonda kullanılabilir kılan da budur. Uzantı cüzdanları masaüstünde tam olarak desteklenmeye devam eder.',
  'Can Everspan take my funds?': 'Everspan varlıklarımı alabilir mi?',
  'There is no code path that would let it. Every payout goes to the caller that authorized it, from that caller’s own balance, and the vaults holding deposits have no admin entry point at all.':
    'Buna izin verecek bir kod yolu yok. Her ödeme, onu yetkilendiren çağırana, yine o çağıranın kendi bakiyesinden yapılır ve mevduatları tutan kasaların hiç yönetici giriş noktası yoktur.',
  'Why does it ask me to approve twice?': 'Neden iki kez onay istiyor?',
  'Because two things are happening, and each is its own on-chain call. Everspan shows the preparation step rather than bundling it invisibly, so what the wallet asks you to sign matches what the screen said it would do.':
    'Çünkü iki şey oluyor ve her biri kendi zincir üstü çağrısı. Everspan hazırlık adımını görünmez biçimde paketlemek yerine gösterir; böylece cüzdanın imzalamanızı istediği şey, ekranın yapacağını söylediği şeyle örtüşür.',
  'Will there be a mainnet deployment?': 'Ana ağ dağıtımı olacak mı?',
  'Not in this repository. There is no mainnet configuration, by design — this is a Testnet protocol built to demonstrate the mechanism end to end.':
    'Bu depoda olmayacak. Tasarım gereği ana ağ yapılandırması yok — bu, mekanizmayı uçtan uca göstermek için kurulmuş bir Testnet protokolü.',

  // ── 09 · Glossary ───────────────────────────────────────────────────────
  'The position that redeems for the full underlying amount at maturity. On chain it is the PT token.':
    'Vadede dayanak varlığın tamamı karşılığında itfa edilen pozisyon. Zincir üzerinde PT tokenidir.',
  'The position that collects everything the deposit releases before maturity. On chain it is the YT token.':
    'Mevduatın vadeden önce serbest bıraktığı her şeyi toplayan pozisyon. Zincir üzerinde YT tokenidir.',
  'The one interface every yield source is wrapped into, exposing a single rate that can only go up. Abbreviated SY.':
    'Her getiri kaynağının sarmalandığı tek arayüz; yalnızca yukarı gidebilen tek bir oran yayımlar. Kısaltması SY.',
  'The timestamp a pair of positions is tied to. Yield stops there and principal becomes redeemable.':
    'Bir pozisyon çiftinin bağlı olduğu zaman damgası. Getiri orada durur ve anapara itfa edilebilir hâle gelir.',
  'Exchange rate': 'Döviz kuru',
  'How much underlying one unit of standardized yield is worth. Its growth over time is the yield.':
    'Bir birim standartlaştırılmış getirinin kaç birim dayanak varlık ettiği. Zamanla büyümesi getirinin kendisidir.',
  'Settlement index': 'Uzlaşma endeksi',
  'The exchange rate at a holder’s last settlement. The gap between it and the current rate is what that holder is owed.':
    'Bir sahibin son uzlaşmasındaki döviz kuru. Bununla güncel oran arasındaki fark, o sahibin alacağıdır.',
  'The annualized return implied by what a principal position costs today and what it redeems for at maturity.':
    'Bir anapara pozisyonunun bugünkü maliyeti ile vadedeki itfa değerinin ima ettiği yıllıklandırılmış getiri.',
  'How far a trade moves the pool price against itself. It grows with trade size and shrinks with pool depth.':
    'Bir işlemin havuz fiyatını kendi aleyhine ne kadar hareket ettirdiği. İşlem büyüklüğüyle artar, havuz derinliğiyle azalır.',
  Slippage: 'Kayma',
  'The gap you are willing to accept between the quoted price and the filled price before the transaction should fail instead.':
    'İşlemin başarısız olması gerekmeden önce, teklif edilen fiyatla gerçekleşen fiyat arasında kabul etmeye razı olduğunuz fark.',
  Stroop: 'Stroop',
  'The smallest unit on Stellar, a ten-millionth. All protocol arithmetic is in stroops, never in decimals.':
    'Stellar üzerindeki en küçük birim, on milyonda bir. Protokoldeki tüm aritmetik ondalıklarla değil, stroop cinsinden yapılır.',
  'SEP-41': 'SEP-41',
  'The Stellar token interface. Both positions and both vault share tokens implement it, so any wallet or contract can move them.':
    'Stellar token arayüzü. Her iki pozisyon ve her iki kasa payı tokeni bunu uygular; böylece herhangi bir cüzdan veya sözleşme onları taşıyabilir.',
  Soroban: 'Soroban',
  'Stellar’s smart contract platform. All seven Everspan contracts are Soroban contracts written in Rust.':
    'Stellar’ın akıllı sözleşme platformu. Yedi Everspan sözleşmesinin tamamı Rust ile yazılmış Soroban sözleşmeleridir.',
  Blend: 'Blend',
  'A lending protocol on Stellar. Everspan’s second market sits on a real Blend v2 pool on Testnet.':
    'Stellar üzerinde bir borç verme protokolü. Everspan’ın ikinci piyasası Testnet’teki gerçek bir Blend v2 havuzunun üzerinde durur.',
  Friendbot: 'Friendbot',
  'The Testnet faucet that funds a new account with test XLM so it exists on the ledger.':
    'Yeni bir hesabı test XLM’i ile fonlayarak defterde var olmasını sağlayan Testnet musluğu.',

  // ── 10 · Resources ──────────────────────────────────────────────────────
  Everspan: 'Everspan',
  'Source code, all seven contracts and the frontend':
    'Kaynak kodu, yedi sözleşmenin tamamı ve arayüz',
  'Architecture: diagrams, the cross-contract call inventory, the rounding law':
    'Mimari: diyagramlar, sözleşmeler arası çağrı envanteri, yuvarlama kuralı',
  'Deployment: the scripts, end to end': 'Dağıtım: betikler, uçtan uca',
  'Runbooks: operational procedures': 'Çalıştırma kılavuzları: operasyonel prosedürler',
  'A two-minute walkthrough of the whole flow': 'Tüm akışın iki dakikalık anlatımı',
  'Stellar and Soroban': 'Stellar ve Soroban',
  'Soroban smart contract documentation': 'Soroban akıllı sözleşme dokümantasyonu',
  'SEP-41, the token interface': 'SEP-41, token arayüzü',
  'Stellar Expert, the Testnet explorer': 'Stellar Expert, Testnet gezgini',
  'Blend, the lending protocol behind the second market':
    'Blend, ikinci piyasanın arkasındaki borç verme protokolü',
  'Something missing?': 'Eksik bir şey mi var?',
  'If this page did not answer your question, the architecture document goes a level deeper on every mechanism described here, and the contracts themselves are readable — each one is a few hundred lines of commented Rust.':
    'Bu sayfa sorunuzu yanıtlamadıysa mimari belgesi burada anlatılan her mekanizmada bir seviye daha derine iner ve sözleşmelerin kendisi de okunabilir — her biri birkaç yüz satır yorumlanmış Rust kodudur.',
}
