export type Language = 'en' | 'tr'

/**
 * The English UI is the canonical copy. Keeping Turkish beside it makes missing
 * translations easy to spot in review and lets the DOM bridge translate legacy
 * components without coupling financial logic to presentation concerns.
 */
const EN_TO_TR: Record<string, string> = {
  'Skip to main content': 'Ana içeriğe geç',
  'App — Everspan': 'Uygulama — Everspan',
  'Wallet disconnected.': 'Cüzdan bağlantısı kesildi.',
  'Share feedback': 'Geri bildirim paylaş',
  'Testnet only. Never share your secret key.':
    'Yalnızca Testnet. Gizli anahtarınızı asla paylaşmayın.',
  'Stellar Testnet only. Never share your secret key.':
    'Yalnızca Stellar Testnet. Gizli anahtarınızı asla paylaşmayın.',
  Overview: 'Genel Bakış',
  Earn: 'Kazanç',
  Portfolio: 'Portföy',
  More: 'Daha Fazla',
  'Product sections': 'Ürün bölümleri',
  'Everspan home': 'Everspan ana sayfası',
  'Yield source': 'Getiri kaynağı',
  'Each source is a separate deployment. Switching reloads balances and positions from that market.':
    'Her kaynak ayrı bir dağıtımdır. Geçiş yaptığınızda o piyasadaki bakiyeler ve pozisyonlar yeniden yüklenir.',
  Appearance: 'Görünüm',
  'Use light theme': 'Açık temayı kullan',
  'Use dark theme': 'Koyu temayı kullan',
  'Switch to Turkish': 'Türkçeye geç',
  'Switch to English': 'İngilizceye geç',
  Transactions: 'İşlemler',
  Notifications: 'Bildirimler',
  'No notifications yet': 'Henüz bildirim yok',
  'Updates about your transactions and account will appear here.':
    'Hesabınız ve işlemlerinizle ilgili güncellemeler burada görünecek.',
  'Preparing the transaction…': 'İşlem hazırlanıyor…',
  'Waiting for your wallet…': 'Cüzdanınız bekleniyor…',
  'Waiting for Stellar confirmation…': 'Stellar onayı bekleniyor…',
  'Outcome could not be verified yet.': 'Sonuç henüz doğrulanamadı.',
  'Contract IDs are not configured. Set the': 'Sözleşme kimlikleri yapılandırılmamış.',
  'variables to point at a deployment.': 'değişkenlerini bir dağıtıma yönlendirin.',
  'Connect a Testnet wallet to lock a fixed return, hold yield exposure, or earn trading fees.':
    'Sabit getiri kilitlemek, getiri pozisyonu tutmak veya işlem ücretlerinden kazanmak için bir Testnet cüzdanı bağlayın.',
  'Connect a Testnet wallet to see your positions and claimable yield.':
    'Pozisyonlarınızı ve talep edilebilir getirinizi görmek için bir Testnet cüzdanı bağlayın.',
  'Connect a Testnet wallet to prepare your balance or manually split a position.':
    'Bakiyenizi hazırlamak veya bir pozisyonu manuel olarak ayırmak için Testnet cüzdanı bağlayın.',

  // Marketing site
  'Everspan — fixed yield, built on Stellar': 'Everspan — Stellar üzerinde sabit getiri',
  'Tradeable market': 'İşlem yapılabilir piyasa',
  'Tradeable markets': 'İşlem yapılabilir piyasalar',
  'LIVE ON TESTNET': 'TESTNET’TE CANLI',
  'Pool liquidity': 'Havuz likiditesi',
  'ON CHAIN': 'ZİNCİR ÜZERİNDE',
  'AMM swap fee': 'AMM takas ücreti',
  'FIXED FEE': 'SABİT ÜCRET',
  'Soroban contracts': 'Soroban sözleşmeleri',
  'OPEN SOURCE': 'AÇIK KAYNAK',
  'Yield, on your terms.': 'Getiri, sizin koşullarınızla.',
  'Yield, on your terms': 'Getiri, sizin koşullarınızla',
  'Explore Innovation': 'Yeniliği Keşfedin',
  'Your principal, protected. Your yield, your call.':
    'Anaparanız korunsun. Getirinizin kararını siz verin.',
  'Launch App': 'Uygulamayı Aç',
  'See how it works': 'Nasıl çalıştığını görün',
  'The Everspan primitive': 'Everspan’ın temeli',
  'One deposit becomes a market.': 'Tek bir mevduat, bir piyasaya dönüşür.',
  'Three steps turn a yield-bearing deposit into two tradeable positions.':
    'Üç adım, getiri sağlayan bir mevduatı işlem yapılabilir iki pozisyona dönüştürür.',
  'How a position is built': 'Pozisyon nasıl oluşturulur',
  'Know what comes back.': 'Ne kadar geri alacağınızı bilin.',
  'Principal trades below its maturity value. The difference between what you pay and what you redeem defines the implied rate for your position.':
    'Anapara, vade değerinin altında işlem görür. Ödediğiniz tutarla vade sonunda aldığınız tutar arasındaki fark, pozisyonunuzun örtük oranını belirler.',
  'Hold the rate itself.': 'Getirinin kendisini tutun.',
  'The yield side receives what is released before maturity. When it moves, Everspan settles both holders first—accrued yield always follows the time it was earned.':
    'Kazanç tarafı, vadeden önce oluşanı alır. Transfer edildiğinde Everspan önce iki tarafın da hesabını kapatır; biriken getiri her zaman kazanıldığı döneme ait olur.',
  'The market': 'Piyasa',
  'Make the market.': 'Piyasayı oluşturun.',
  'Swap the principal against your deposit, or provide both sides as liquidity. Every pool is tied to one maturity, with a transparent 30 bps fee on each trade.':
    'Anaparayı yatırdığınız varlıkla takas edin veya iki tarafı da likidite olarak sağlayın. Her havuz tek bir vadeye bağlıdır ve her işlemde şeffaf 30 baz puan ücret alınır.',
  'Yield sources': 'Getiri kaynakları',
  'One standard interface.': 'Tek bir standart arayüz.',
  'Start with deterministic mUSDY or use a live Blend-backed XLM position. The same split, settlement and market mechanics run across both.':
    'Belirli getirili mUSDY ile başlayın veya Blend destekli canlı bir XLM pozisyonu kullanın. Aynı ayırma, uzlaşma ve piyasa mekanikleri ikisinde de çalışır.',
  'Deterministic yield': 'Belirli getiri',
  'A ledger-time exchange rate built for repeatable protocol testing.':
    'Tekrarlanabilir protokol testleri için defter zamanına dayalı döviz kuru.',
  'Live lending yield': 'Canlı borç verme getirisi',
  'A real Blend v2 lending position behind the same standard interface.':
    'Aynı standart arayüzün arkasında gerçek bir Blend v2 borç verme pozisyonu.',
  'Protocol assurance': 'Protokol güvencesi',
  'Your wallet stays in control.': 'Kontrol cüzdanınızda kalır.',
  'Signing happens inside your wallet. Contracts are open source and deployed on Stellar Testnet. There is no admin path into user balances.':
    'İmzalama cüzdanınızın içinde gerçekleşir. Sözleşmeler açık kaynaklıdır ve Stellar Testnet üzerinde dağıtılmıştır. Kullanıcı bakiyelerine erişen bir yönetici yolu yoktur.',
  'Self-custodial': 'Kendi saklama modeliniz',
  'Your secret key never enters Everspan.': 'Gizli anahtarınız Everspan’a hiçbir zaman girmez.',
  'Open source': 'Açık kaynak',
  'Seven Soroban contracts, documented and tested.':
    'Belgelenmiş ve test edilmiş yedi Soroban sözleşmesi.',
  'Explicit settlement': 'Açık uzlaşma',
  'Maturity and redemption rules execute on-chain.':
    'Vade ve itfa kuralları zincir üzerinde yürütülür.',
  'Put your yield to work.': 'Getirinizi çalıştırın.',
  'No account. Connect a Stellar wallet.': 'Hesap gerekmez. Bir Stellar cüzdanı bağlayın.',
  'Primary navigation': 'Ana navigasyon',
  Protocol: 'Protokol',
  Markets: 'Piyasalar',
  Security: 'Güvenlik',
  'Illustrative principal position': 'Örnek anapara pozisyonu',
  'Cost today': 'Bugünkü maliyet',
  'Redeem at maturity': 'Vadede itfa',
  Entry: 'Giriş',
  '90 days': '90 gün',
  Maturity: 'Vade',
  'Yield accrual': 'Getiri birikimi',
  'Yield is measured against each holder’s settlement index and stops exactly at maturity.':
    'Getiri, her sahibin uzlaşma endeksine göre ölçülür ve tam olarak vadede durur.',
  'Constant product pool': 'Sabit çarpan havuzu',
  Principal: 'Anapara',
  'Fee per swap': 'Takas başına ücret',
  'Stellar Testnet · Soroban · 2026': 'Stellar Testnet · Soroban · 2026',

  // Product navigation and overview
  'What do you want your yield to do?': 'Getirinizin ne yapmasını istersiniz?',
  'Choose an outcome first. Everspan shows the token mechanics only when they matter.':
    'Önce hedefinizi seçin. Everspan token mekaniklerini yalnızca gerektiğinde gösterir.',
  'Explore before connecting': 'Bağlanmadan önce keşfedin',
  'See the outcome first.': 'Önce sonucu görün.',
  'Compare live maturities below. Connect your wallet only when you are ready to act.':
    'Aşağıdaki canlı vadeleri karşılaştırın. Cüzdanınızı yalnızca işlem yapmaya hazır olduğunuzda bağlayın.',
  'Data unavailable': 'Veri kullanılamıyor',
  'We couldn’t load your balances.': 'Bakiyelerinizi yükleyemedik.',
  'Your assets have not changed. Retry the read before choosing an action.':
    'Varlıklarınız değişmedi. Bir işlem seçmeden önce verileri yeniden okuyun.',
  'Try again': 'Tekrar dene',
  'Your next step': 'Sıradaki adımınız',
  'Fund your test wallet.': 'Test cüzdanınıza bakiye ekleyin.',
  'Recommended next': 'Önerilen sonraki adım',
  'Choose your return.': 'Getirinizi seçin.',
  'Lock a maturity-based rate or keep exposure to the variable yield. If your asset needs preparing first, that step is shown before you approve.':
    'Vadeye dayalı bir oranı kilitleyin veya değişken getiriye açık kalın. Varlığınızın önce hazırlanması gerekiyorsa, bu adım onaydan önce gösterilir.',
  'Compare fixed returns': 'Sabit getirileri karşılaştır',
  'Position ready': 'Pozisyon hazır',
  'Your position is working.': 'Pozisyonunuz çalışıyor.',
  'Review what you hold, claim available yield, or manage an existing liquidity position.':
    'Varlıklarınızı inceleyin, mevcut getiriyi talep edin veya likidite pozisyonunuzu yönetin.',
  'Open portfolio': 'Portföyü aç',
  'Loading your next step': 'Sıradaki adımınız yükleniyor',
  'Lock a fixed return': 'Sabit getiri kilitle',
  'Know the maturity and implied rate before signing.':
    'İmzalamadan önce vadeyi ve örtük oranı bilin.',
  'Increase yield exposure': 'Getiri pozisyonunu artır',
  'Hold the variable yield released before maturity.':
    'Vadeden önce oluşan değişken getiriyi tutun.',
  'Earn trading fees': 'İşlem ücretlerinden kazan',
  'Provide liquidity and earn the 0.30% swap fee.':
    'Likidite sağlayın ve %0,30 takas ücretini kazanın.',
  'Live opportunities': 'Canlı fırsatlar',

  // Wallet, connection, and common actions
  'Connect to start': 'Başlamak için bağlanın',
  'Connecting lets Everspan view your public address and request transactions. Your wallet must approve every transaction; Everspan cannot move funds on its own.':
    'Bağlantı, Everspan’ın açık adresinizi görmesini ve işlem istemesini sağlar. Her işlemi cüzdanınız onaylamalıdır; Everspan kendi başına varlık taşıyamaz.',
  'Connect wallet': 'Cüzdanı bağla',
  'Connect Wallet': 'Cüzdanı Bağla',
  'Connecting…': 'Bağlanıyor…',
  Disconnect: 'Bağlantıyı kes',
  Wallet: 'Cüzdan',
  Address: 'Adres',
  'Copy address': 'Adresi kopyala',
  Copied: 'Kopyalandı',
  'Address copied': 'Adres kopyalandı',
  'Address copied.': 'Adres kopyalandı.',
  'Could not copy the address.': 'Adres kopyalanamadı.',
  'Wait for the active transaction to finish': 'Etkin işlemin bitmesini bekleyin',
  'Network unverified.': 'Ağ doğrulanamadı.',
  'Everspan uses Stellar Testnet; your wallet is on':
    'Everspan Stellar Testnet kullanıyor; cüzdanınızın ağı:',
  'Switch the active network in your wallet. Financial actions are paused until it matches.':
    'Cüzdanınızdaki etkin ağı değiştirin. Ağ eşleşene kadar finansal işlemler duraklatılır.',
  'Your wallet didn’t report its network — make sure it’s on Stellar Testnet before sending.':
    'Cüzdanınız ağ bilgisini bildirmedi — göndermeden önce Stellar Testnet’te olduğundan emin olun.',
  'Connection lost.': 'Bağlantı kesildi.',
  'Secure transaction protection is unavailable.': 'Güvenli işlem koruması kullanılamıyor.',
  'Your form is preserved. No new transaction can be submitted until you are back online.':
    'Formunuz korundu. Yeniden çevrimiçi olana kadar yeni işlem gönderilemez.',
  'Transactions are paused. Use a current browser, enable site storage, and reload.':
    'İşlemler duraklatıldı. Güncel bir tarayıcı kullanın, site depolamasını etkinleştirin ve sayfayı yenileyin.',
  'Financial actions are paused': 'Finansal işlemler duraklatıldı',
  'Everspan will not treat an unread balance or position as zero. Refresh the verified data before continuing.':
    'Everspan okunamayan bakiye veya pozisyonu sıfır kabul etmez. Devam etmeden önce doğrulanmış verileri yenileyin.',
  'Refresh verified data': 'Doğrulanmış verileri yenile',
  'Refresh balances': 'Bakiyeleri yenile',
  'Refresh balance': 'Bakiyeyi yenile',
  'Refresh portfolio': 'Portföyü yenile',
  'Loading portfolio': 'Portföy yükleniyor',
  'just now': 'az önce',
  'Loading balances…': 'Bakiyeler yükleniyor…',
  'Working…': 'İşleniyor…',
  Close: 'Kapat',
  'Dismiss notification': 'Bildirimi kapat',
  Amount: 'Tutar',
  'Loading wallet balances': 'Cüzdan bakiyeleri yükleniyor',
  Reload: 'Yeniden yükle',
  'An unexpected error occurred. Reloading usually fixes it.':
    'Beklenmeyen bir hata oluştu. Yeniden yüklemek genellikle sorunu çözer.',

  // Earn, portfolio, conversion, and activity
  'Fixed return': 'Sabit getiri',
  'Buy principal below its maturity value.': 'Anaparayı vade değerinin altında satın alın.',
  'Yield exposure': 'Getiri pozisyonu',
  'Keep the variable yield position.': 'Değişken getiri pozisyonunu tutun.',
  'Trading fees': 'İşlem ücretleri',
  'Provide liquidity and earn swap fees.': 'Likidite sağlayın ve takas ücretlerinden kazanın.',
  'Earning strategy': 'Kazanç stratejisi',
  Yield: 'Kazanç',
  'Redeemable for its full maturity value, no matter what the yield did.':
    'Getiri ne yaparsa yapsın, vade değerinin tamamı karşılığında itfa edilebilir.',
  'The yield released by the position before maturity.':
    'Pozisyonun vadeden önce oluşturduğu getiri.',
  'Choose the outcome.': 'Hedefinizi seçin.',
  'Start with what you want to achieve. The review shows exactly what moves before your wallet opens.':
    'Ulaşmak istediğiniz sonuçla başlayın. İnceleme ekranı, cüzdanınız açılmadan önce nelerin hareket edeceğini açıkça gösterir.',
  'What do Principal and Yield mean?': 'Anapara ve Kazanç ne anlama gelir?',
  'Lock a fixed rate': 'Sabit oran kilitle',
  'Buy principal at today’s price and redeem its maturity value later.':
    'Anaparayı bugünkü fiyattan alın, vade değerini daha sonra itfa edin.',
  'Separate your asset, sell the principal side, and keep the variable yield side.':
    'Varlığınızı ayırın, anapara tarafını satın ve değişken getiri tarafını tutun.',
  'Review fixed return': 'Sabit getiriyi incele',
  'You pay': 'Ödeyeceğiniz',
  'You receive at least': 'En az alacağınız',
  'Fixed APY': 'Sabit APY',
  'Quoted principal': 'Teklif edilen anapara',
  'Price impact': 'Fiyat etkisi',
  'Maximum slippage': 'İzin verilen en yüksek kayma',
  'Max slippage': 'Maks. kayma',
  'This trade locks in a loss': 'Bu işlem zararı kesinleştirir',
  'Locking rate…': 'Oran kilitleniyor…',
  'Preparing…': 'Hazırlanıyor…',
  'Existing principal needs a choice': 'Mevcut anapara için seçim gerekiyor',
  'Split is already complete': 'Ayırma zaten tamamlandı',
  'Review yield exposure': 'Getiri pozisyonunu incele',
  'You use': 'Kullandığınız',
  'Yield you keep': 'Tutacağınız kazanç',
  'Principal sold for': 'Anapara satış karşılığı',
  'Estimated net cost': 'Tahmini net maliyet',
  'Review remaining transaction': 'Kalan işlemi incele',
  'Principal sold': 'Satılan anapara',
  Split: 'Ayır',
  Sell: 'Sat',
  principal: 'anapara',
  'Sell principal': 'Anapara sat',
  'Splitting…': 'Ayrılıyor…',
  'Selling…': 'Satılıyor…',
  'Principal (all maturities)': 'Anapara (tüm vadeler)',
  'Open maturities': 'Açık vadeler',
  'Claimable yield': 'Talep edilebilir getiri',
  'Claimable now': 'Şimdi talep edilebilir',
  Claim: 'Talep et',
  Redeem: 'İtfa et',
  'Claiming…': 'Talep ediliyor…',
  'Redeeming…': 'İtfa ediliyor…',
  'Your positions': 'Pozisyonlarınız',
  'Separate an asset at a maturity to open a position — your principal, yield and claimable yield will appear here.':
    'Pozisyon açmak için bir varlığı vadede ayırın; anapara, kazanç ve talep edilebilir getiriniz burada görünecek.',
  Matured: 'Vadesi doldu',
  'Settled — principal redeemed and yield claimed.':
    'Uzlaşıldı — anapara itfa edildi ve getiri talep edildi.',
  'Claim yield': 'Getiriyi talep et',
  'Redeem principal': 'Anaparayı itfa et',
  'No yield to claim yet — it accrues over time.':
    'Henüz talep edilecek getiri yok — zamanla birikir.',
  'The principal redeems in full once matured.':
    'Anapara, vadesi dolduğunda tamamı karşılığında itfa edilir.',
  'Switch your wallet to Testnet to act.': 'İşlem yapmak için cüzdanınızı Testnet’e geçirin.',
  Shares: 'Paylar',
  'Principal value': 'Anapara değeri',
  'SY value': 'SY değeri',
  Manage: 'Yönet',
  'Tools and activity.': 'Araçlar ve etkinlik.',
  'Convert assets or inspect protocol events. These tools are useful, but they are not the starting point.':
    'Varlıkları dönüştürün veya protokol olaylarını inceleyin. Bu araçlar faydalıdır ancak başlangıç noktası değildir.',
  'Secondary tools': 'İkincil araçlar',
  'Convert assets': 'Varlıkları dönüştür',
  'Protocol activity': 'Protokol etkinliği',
  'Convert and split assets': 'Varlıkları dönüştür ve ayır',
  'Most people can start from Earn instead.':
    'Çoğu kullanıcı doğrudan Kazanç bölümünden başlayabilir.',
  'for Everspan, or manually separate principal and yield. Most people can start from Earn instead.':
    'varlığını Everspan için hazırlayın veya anapara ile getiriyi manuel olarak ayırın. Çoğu kullanıcı doğrudan Kazanç bölümünden başlayabilir.',
  'Prepare an asset': 'Bir varlık hazırlayın',
  'Wrap or unwrap mode': 'Dönüştürme modu',
  'Return from SY': 'SY’den geri dönüştür',
  'Review conversion': 'Dönüşümü incele',
  'You convert': 'Dönüştürdüğünüz',
  'You receive': 'Alacağınız',
  'Wrapping…': 'Dönüştürülüyor…',
  'Unwrapping…': 'Geri dönüştürülüyor…',
  'Confirm conversion to SY': 'SY’ye dönüşümü onayla',
  'Separate principal and yield': 'Anapara ile getiriyi ayır',
  'Split or merge mode': 'Ayırma veya birleştirme modu',
  'Separate into PT + YT': 'PT + YT olarak ayır',
  'Recombine into SY': 'SY olarak yeniden birleştir',
  'Review separation': 'Ayırmayı incele',
  'Review recombination': 'Birleştirmeyi incele',
  'Confirm separation': 'Ayırmayı onayla',
  'Confirm recombination': 'Birleştirmeyi onayla',
  'Merging…': 'Birleştiriliyor…',
  'Your setup progress': 'Kurulum ilerlemeniz',
  'Getting started': 'Başlarken',
  'Prepare for Everspan': 'Everspan için hazırlanın',
  'Choose an outcome': 'Bir hedef seçin',
  'Keep principal, yield, or both — Everspan handles the matching positions.':
    'Anaparayı, getiriyi veya ikisini birden tutun; eşleşen pozisyonları Everspan yönetir.',
  'Use the faucet for demo yield tokens.': 'Demo getiri tokenları için musluğu kullanın.',
  'Fund the account with Friendbot.': 'Hesabı Friendbot ile fonlayın.',
  'Your recent activity': 'Son etkinlikleriniz',
  'Confirmed Everspan actions from the connected wallet.':
    'Bağlı cüzdandaki onaylanmış Everspan işlemleri.',
  'Public on-chain events across this market. This is not your personal transaction history.':
    'Bu piyasadaki herkese açık zincir üstü olaylar. Bu, kişisel işlem geçmişiniz değildir.',
  'Loading activity': 'Etkinlik yükleniyor',
  'Couldn’t load activity': 'Etkinlik yüklenemedi',
  'No confirmed actions yet': 'Henüz onaylanmış işlem yok',
  'No protocol activity yet': 'Henüz protokol etkinliği yok',
  'Your completed conversions, trades, claims, and liquidity actions will appear here.':
    'Tamamlanan dönüşüm, işlem, talep ve likidite hareketleriniz burada görünecek.',
  'New on-chain events will appear here automatically.':
    'Yeni zincir üstü olaylar burada otomatik olarak görünecek.',
  'Live updates paused. Showing the most recent confirmed activity.':
    'Canlı güncellemeler duraklatıldı. En son onaylanan etkinlik gösteriliyor.',
  'View transaction on Stellar Expert': 'İşlemi Stellar Expert’te görüntüle',
  Faucet: 'Musluk',
  Wrap: 'Dönüştür',
  Unwrap: 'Geri dönüştür',
  Merge: 'Birleştir',
  Swap: 'Takas',
  'Add LP': 'LP ekle',
  'Remove LP': 'LP kaldır',

  // Pools and transaction lifecycle
  'Loading liquidity pools': 'Likidite havuzları yükleniyor',
  'No liquidity pool is available right now.': 'Şu anda kullanılabilir likidite havuzu yok.',
  'Add or remove liquidity': 'Likidite ekle veya kaldır',
  Add: 'Ekle',
  Remove: 'Kaldır',
  'Add liquidity': 'Likidite ekle',
  'Remove liquidity': 'Likidite kaldır',
  'Review liquidity deposit': 'Likidite yatırma işlemini incele',
  'You provide': 'Sağlayacağınız',
  'PT paired': 'Eşleştirilen PT',
  'LP shares received': 'Alınacak LP payları',
  'Pool swap fee rate': 'Havuz takas ücret oranı',
  'Adding…': 'Ekleniyor…',
  'Pool matured — adds closed': 'Havuzun vadesi doldu — ekleme kapalı',
  'Confirm liquidity deposit': 'Likidite yatırmayı onayla',
  'Review withdrawal': 'Çekme işlemini incele',
  'LP shares burned': 'Yakılacak LP payları',
  'PT returned': 'Dönen PT',
  'SY returned': 'Dönen SY',
  'Removing…': 'Kaldırılıyor…',
  Unavailable: 'Kullanılamıyor',
  'No pool': 'Havuz yok',
  Underlying: 'Dayanak varlık',
  Liquidity: 'Likidite',
  'This maturity has passed — trading is closed': 'Bu vade geçti — işlemler kapalı',
  'This maturity has no liquidity yet': 'Bu vadede henüz likidite yok',
  'Available maturities': 'Kullanılabilir vadeler',
  'Compare the implied return, time remaining, and available liquidity before choosing.':
    'Seçmeden önce örtük getiriyi, kalan süreyi ve kullanılabilir likiditeyi karşılaştırın.',
  'Loading available maturities': 'Kullanılabilir vadeler yükleniyor',
  'No maturities exist yet. The admin creates a maturity (and its pool) before trading opens.':
    'Henüz vade yok. İşlemler açılmadan önce yönetici bir vade ve havuz oluşturur.',
  'Every maturity has expired. A new one has to be created before trading reopens.':
    'Tüm vadelerin süresi doldu. İşlemler yeniden açılmadan önce yeni bir vade oluşturulmalıdır.',
  'Lock rate': 'Oranı kilitle',
  'Provide liquidity': 'Likidite sağla',
  "Deposit PT and SY into a maturity's pool to earn the 0.30% swap fee.":
    'PT ve SY’yi bir vade havuzuna yatırarak %0,30 takas ücretini kazanın.',
  'Both assets enter the same maturity pool in one transaction.':
    'İki varlık da tek işlemde aynı vade havuzuna girer.',
  'Future swaps pay a 0.30% fee shared pro-rata among liquidity providers. The value and PT/SY mix of your position can change before you withdraw.':
    'Gelecekteki takaslar, likidite sağlayıcıları arasında oransal paylaşılan %0,30 ücret öder. Pozisyonunuzun değeri ve PT/SY dağılımı çekimden önce değişebilir.',
  'Slippage and fee details': 'Kayma ve ücret ayrıntıları',
  'Your wallet shows the final Stellar network fee before approval.':
    'Cüzdanınız onaydan önce son Stellar ağ ücretini gösterir.',
  'Your wallet shows the final Stellar network fee before each approval.':
    'Cüzdanınız her onaydan önce son Stellar ağ ücretini gösterir.',
  'Confirm withdrawal': 'Çekimi onayla',
  'Switch your wallet to Testnet to continue.': 'Devam etmek için cüzdanınızı Testnet’e geçirin.',
  'You need': 'Bu işlem için',
  'PT to pair with that SY — reduce the amount, or': 'PT gerekiyor — tutarı azaltın veya',
  'prepare PT in Convert': 'Dönüştür bölümünde PT hazırlayın',
  'You have no LP shares in the': 'Şu havuzda LP payınız yok:',
  'Transaction progress': 'İşlem ilerlemesi',
  Prepare: 'Hazırla',
  Approve: 'Onayla',
  Confirm: 'Kesinleştir',
  'Preparing transaction': 'İşlem hazırlanıyor',
  'Approve in your wallet': 'Cüzdanınızda onaylayın',
  'Confirming on Stellar': 'Stellar üzerinde kesinleştiriliyor',
  'Checking the latest state and expected result before signing.':
    'İmzadan önce son durum ve beklenen sonuç kontrol ediliyor.',
  'Review the request in your wallet. You can cancel without moving funds.':
    'İsteği cüzdanınızda inceleyin. Varlık taşımadan iptal edebilirsiniz.',
  'The transaction was submitted. Keep this page open while Stellar confirms it.':
    'İşlem gönderildi. Stellar onaylarken bu sayfayı açık tutun.',
  'Confirmation needs checking': 'Onayın kontrol edilmesi gerekiyor',
  'Copy transaction hash': 'İşlem kimliğini kopyala',
  'Hash copied': 'Kimlik kopyalandı',
  'Transaction hash copied.': 'İşlem kimliği kopyalandı.',
  'Checking…': 'Kontrol ediliyor…',
  Live: 'Canlı',
  'Check on Stellar Expert': 'Stellar Expert’te kontrol et',
  'View on Stellar Expert': 'Stellar Expert’te görüntüle',
  confirmed: 'onaylandı',
  'Stellar confirmed the transaction on Testnet. Your balances will update automatically.':
    'Stellar işlemi Testnet’te onayladı. Bakiyeleriniz otomatik olarak güncellenecek.',
  'Transaction hash': 'İşlem kimliği',
  'Other financial actions are paused until this finishes.':
    'Bu işlem tamamlanana kadar diğer finansal işlemler duraklatıldı.',
  'Everspan is preparing the transaction and checking its expected result.':
    'Everspan işlemi hazırlıyor ve beklenen sonucu kontrol ediyor.',
  'Finish or reject the request in your wallet.': 'İsteği cüzdanınızda tamamlayın veya reddedin.',
  'The transaction was submitted and is waiting for Stellar confirmation.':
    'İşlem gönderildi ve Stellar onayı bekleniyor.',
  'Everspan could not verify the final outcome of':
    'Everspan şu işlemin nihai sonucunu doğrulayamadı:',
  '. Do not submit it again until you check its status or your wallet activity.':
    '. Durumunu veya cüzdan etkinliğinizi kontrol etmeden yeniden göndermeyin.',
  'Last update:': 'Son güncelleme:',
  'Recheck status': 'Durumu yeniden kontrol et',
  'I verified the result — unlock actions': 'Sonucu doğruladım — işlemlerin kilidini aç',
  'I checked my wallet — unlock actions': 'Cüzdanımı kontrol ettim — işlemlerin kilidini aç',
  'Only unlock after checking your wallet activity and balances. Unlocking does not cancel a transaction that may already have been submitted.':
    'Kilidi yalnızca cüzdan etkinliğinizi ve bakiyelerinizi kontrol ettikten sonra açın. Kilidi açmak, daha önce gönderilmiş olabilecek bir işlemi iptal etmez.',

  // Remaining product guidance
  'No maturities are available yet. The admin must create one before you can split.':
    'Henüz kullanılabilir vade yok. Ayırma yapabilmeniz için yöneticinin bir vade oluşturması gerekir.',
  'This maturity has passed — split and merge are closed. Claim or redeem it under “Your positions”.':
    'Bu vade geçti — ayırma ve birleştirme kapalı. “Pozisyonlarınız” bölümünden talep veya itfa edin.',
  Source: 'Kaynak',
  Deposit: 'Yatırım',
  'Yield-bearing asset': 'Getiri sağlayan varlık',
  'Fixed at maturity': 'Vadede sabit',
  'Position architecture': 'Pozisyon mimarisi',
  PRINCIPAL: 'ANAPARA',
  YIELD: 'KAZANÇ',
  'Principal separated': 'Anapara ayrıldı',
  'Yield until maturity': 'Vadeye kadar getiri',
  'Yield separated': 'Getiri ayrıldı',
  'FIXED RATE': 'SABİT ORAN',
  'YIELD EXPOSURE': 'GETİRİ POZİSYONU',
  'No active maturity is available right now. Try again after a pool has been funded.':
    'Şu anda etkin vade yok. Bir havuz fonlandıktan sonra tekrar deneyin.',
  'Open Convert': 'Dönüştürmeyi aç',
  'Check the outcome below before your wallet opens.':
    'Cüzdanınız açılmadan önce aşağıdaki sonucu kontrol edin.',
  'Hold the principal until maturity for its displayed redemption outcome. Selling earlier may return less.':
    'Gösterilen itfa sonucunu almak için anaparayı vadeye kadar tutun. Daha erken satış daha az getirebilir.',
  'This needs two wallet approvals: preparing your asset, then locking the rate.':
    'Bu işlem iki cüzdan onayı gerektirir: önce varlığınızın hazırlanması, sonra oranın kilitlenmesi.',
  'Price and slippage details': 'Fiyat ve kayma ayrıntıları',
  'I understand this locks a negative rate': 'Bunun negatif bir oranı kilitlediğini anlıyorum',
  'You would pay more for': 'Vade itfa değerinden daha fazla ödeyeceğiniz miktar:',
  'Principal than it redeems for at maturity — a fixed rate of': 'anapara — sabit oran:',
  ". The 0.30% swap fee and this order's price impact together outweigh the yield left until":
    '. %0,30 takas ücreti ve bu emrin fiyat etkisi, şu vadeye kadar kalan getiriyi aşıyor:',
  '. A later maturity, or a deeper pool, prices better.':
    '. Daha ileri bir vade veya daha derin bir havuz daha iyi fiyat sunar.',
  'Confirm fixed return in wallet': 'Sabit getiriyi cüzdanda onayla',
  'The principal redeems in full at maturity — the discount you buy at is your fixed return.':
    'Anapara vade sonunda tamamı karşılığında itfa edilir; satın aldığınız indirim sabit getirinizdir.',
  'Dismiss status': 'Durumu kapat',
  'This strategy needs two wallet approvals. The progress stays visible below.':
    'Bu strateji iki cüzdan onayı gerektirir. İlerleme aşağıda görünür kalır.',
  'This strategy needs three wallet approvals: preparing your asset, then splitting, then selling. Progress stays visible below.':
    'Bu strateji üç cüzdan onayı gerektirir: önce varlığınızın hazırlanması, sonra ayırma, sonra satış. İlerleme aşağıda görünür kalır.',
  'The yield you keep is realized until maturity. Its remaining opportunity falls as maturity approaches, and returns depend on the yield actually earned.':
    'Tuttuğunuz kazanç vadeye kadar gerçekleşir. Vade yaklaştıkça kalan fırsat azalır ve sonuç, gerçekten kazanılan getiriye bağlıdır.',
  'The pool cannot quote this amount of principal right now. Keep the saved step and try again after liquidity is available.':
    'Havuz şu anda bu anapara tutarı için fiyat veremiyor. Kaydedilen adımı koruyun ve likidite oluştuğunda yeniden deneyin.',
  'This separates your asset into principal and yield, then sells the principal — you keep the':
    'Bu işlem varlığınızı anapara ve kazanç olarak ayırır, ardından anaparayı satar — elinizde',
  'for pure exposure.': 'saf pozisyon olarak kalır.',
  'Resume saved step — sell': 'Kaydedilen adıma devam et — sat',
  'Use all': 'Tüm',
  'principal to continue': 'anaparayı devam etmek için kullan',
  'Keep it and start a new split': 'Mevcut olanı tut ve yeni bir ayırma başlat',
  'This wallet already holds': 'Bu cüzdanda zaten',
  'in principal for': 'vadesine ait anapara var:',
  '. It may be a fixed-return holding or the first half of an interrupted yield strategy. Everspan will not split or sell until you choose.':
    '. Bu, sabit getirili bir varlık veya yarım kalmış bir getiri stratejisinin ilk adımı olabilir. Siz seçim yapana kadar Everspan ayırma veya satış yapmaz.',
  'Continue by selling exactly': 'Tam olarak şu tutarı satarak devam edin:',
  'in principal. Everspan will not create another split for this flow.':
    'anapara. Everspan bu akış için başka bir ayırma işlemi oluşturmaz.',
  'Keep this page open until the sale finishes. Everspan could not save this continuation for a reload; existing principal detection will still prevent an automatic duplicate split.':
    'Satış bitene kadar bu sayfayı açık tutun. Everspan bu devam adımını sayfa yenilemesine karşı kaydedemedi; mevcut anapara algılaması yine de otomatik yinelenen ayırmayı önler.',
  until: 'vadeye',
  'h left': 'sa kaldı',
  'matured (': 'vadesi doldu (',
  'This conversion prepares the asset for Everspan. It does not create an additional return by itself. Your wallet shows the final network fee before approval.':
    'Bu dönüşüm varlığı Everspan için hazırlar. Tek başına ek getiri oluşturmaz. Cüzdanınız onaydan önce son ağ ücretini gösterir.',
  'Underlying yield': 'Dayanak getiri',
  'XLM balance': 'XLM bakiyesi',
  '· for network fees': '· ağ ücretleri için',
  'Loading XLM balance': 'XLM bakiyesi yükleniyor',
  'This account isn’t funded yet. On Testnet you can fund it instantly with Friendbot to receive 10,000 test XLM.':
    'Bu hesap henüz fonlanmadı. Testnet’te Friendbot ile anında fonlayıp 10.000 test XLM alabilirsiniz.',
  'Fund with Friendbot': 'Friendbot ile fonla',
  'Liquidity positions': 'Likidite pozisyonları',
  '% of pool': 'havuzun %’si',
  'Manage in Pool': 'Havuzda yönet',
  'Extension wallets can’t connect from a mobile browser — installing the app again won’t change that. Pick':
    'Uzantı cüzdanları mobil tarayıcıdan bağlanamaz; uygulamayı yeniden yüklemek bunu değiştirmez. Cüzdan listesinden',
  'in the wallet list, which works in any browser, or open this page on desktop.':
    'seçeneğini seçin; tüm tarayıcılarda çalışır. Alternatif olarak bu sayfayı masaüstünde açın.',
  'No compatible wallet found. Install': 'Uyumlu cüzdan bulunamadı. Şunu yükleyin:',
  'and try again.': 've tekrar deneyin.',

  // Empty/error pages
  'Page not found — Everspan': 'Sayfa bulunamadı — Everspan',
  'Error 404': 'Hata 404',
  'This page doesn’t exist.': 'Bu sayfa mevcut değil.',
  'The link may be out of date. Everything the protocol does lives on the two pages below.':
    'Bağlantı güncelliğini yitirmiş olabilir. Protokolün sunduğu her şey aşağıdaki iki sayfada bulunur.',
  'Back home': 'Ana sayfaya dön',
  'Something went wrong': 'Bir şeyler ters gitti',

  // Validation and friendly protocol errors
  'Enter an amount.': 'Bir tutar girin.',
  'Enter a valid number.': 'Geçerli bir sayı girin.',
  'Up to 7 decimal places are supported.': 'En fazla 7 ondalık basamak desteklenir.',
  'Amount must be greater than 0.': 'Tutar 0’dan büyük olmalıdır.',
  'Enter an amount greater than 0.': '0’dan büyük bir tutar girin.',
  'You cancelled the transaction.': 'İşlemi iptal ettiniz.',
  'You cancelled the wallet connection.': 'Cüzdan bağlantısını iptal ettiniz.',
  'Your account is not funded yet. Fund it with Friendbot and try again.':
    'Hesabınız henüz fonlanmadı. Friendbot ile fonlayıp tekrar deneyin.',
  'Could not reach the Stellar network. Check your connection and try again.':
    'Stellar ağına ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.',
  'The transaction failed. Please try again.': 'İşlem başarısız oldu. Lütfen tekrar deneyin.',
  'The token is already initialized.': 'Token zaten başlatılmış.',
  'The token has not been initialized yet.': 'Token henüz başlatılmamış.',
  'You don’t have enough tokens for that.': 'Bunun için yeterli tokenınız yok.',
  'The spender allowance is too low.': 'Harcama izni çok düşük.',
  'The faucet is capped at 10,000 tokens per request.':
    'Musluk, istek başına 10.000 token ile sınırlıdır.',
  'Only the admin can do that.': 'Bunu yalnızca yönetici yapabilir.',
  'That amount is too large to process.': 'Bu tutar işlenemeyecek kadar büyük.',
  'That allowance has expired.': 'Bu izin süresi dolmuş.',
  'The vault is already initialized.': 'Kasa zaten başlatılmış.',
  'The vault has not been initialized yet.': 'Kasa henüz başlatılmamış.',
  'That exceeds the balance available to convert back.': 'Bu tutar geri çevrilebilecek bakiyeyi aşıyor.',
  'The Blend pool has no free liquidity right now — everything is lent out. Try a smaller amount or come back shortly.':
    'Blend havuzunda şu anda boş likidite yok; tamamı ödünç verilmiş. Daha küçük bir tutar deneyin veya kısa süre sonra tekrar gelin.',
  'The Blend pool rejected this request.': 'Blend havuzu bu isteği reddetti.',
  'The Blend pool reported an unusable exchange rate.':
    'Blend havuzu kullanılamayan bir döviz kuru bildirdi.',
  'The market is already initialized.': 'Piyasa zaten başlatılmış.',
  'The market has not been initialized yet.': 'Piyasa henüz başlatılmamış.',
  'That maturity does not exist.': 'Bu vade mevcut değil.',
  'That maturity already exists.': 'Bu vade zaten mevcut.',
  'A maturity must be in the future.': 'Vade gelecekte olmalıdır.',
  'This maturity has passed — split and merge are closed.':
    'Bu vade geçti — ayırma ve birleştirme kapalı.',
  'You can only redeem principal at or after maturity.':
    'Anaparayı yalnızca vadede veya vade sonrasında itfa edebilirsiniz.',
  'That exceeds your principal balance.': 'Bu tutar anapara bakiyenizi aşıyor.',
  'That exceeds your yield balance.': 'Bu tutar getiri bakiyenizi aşıyor.',
  'That exceeds the balance available to prepare for this trade.':
    'Bu tutar bu işlem için hazırlanabilecek bakiyeyi aşıyor.',
  'There is no yield to claim yet.': 'Henüz talep edilecek getiri yok.',
  'That underlying ticker is not a valid token symbol.':
    'Dayanak varlığın kodu geçerli bir token sembolü değil.',
  'The AMM has not been initialized yet.': 'AMM henüz başlatılmamış.',
  'There is no pool for that maturity yet.': 'Bu vade için henüz havuz yok.',
  'That pool already exists.': 'Bu havuz zaten mevcut.',
  'This maturity has passed — trading is closed.': 'Bu vade geçti — işlemler kapalı.',
  'The pool is too shallow for that trade.': 'Havuz bu işlem için yeterince derin değil.',
  'The price moved beyond your slippage limit. Try again.':
    'Fiyat, kayma limitinizin dışına çıktı. Tekrar deneyin.',
  'That exceeds your pool share.': 'Bu tutar havuz payınızı aşıyor.',
  'This AMM is wired to a different SY token than the market it points at.':
    'Bu AMM, bağlı olduğu piyasadan farklı bir SY tokenına ayarlanmış.',
  'The selected wallet is not available. Install it and try again.':
    'Seçilen cüzdan kullanılamıyor. Yükleyip tekrar deneyin.',
  'This account is already funded on Testnet.': 'Bu hesap Testnet’te zaten fonlanmış.',
  'Could not load your balance from the network. Check your connection and try again.':
    'Bakiyeniz ağdan yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.',
  'Could not reach the Stellar network. Check your internet connection, or disable a VPN or ad blocker that might be blocking the request, and try again.':
    'Stellar ağına ulaşılamadı. İnternet bağlantınızı kontrol edin, ya da isteği engelliyor olabilecek bir VPN veya reklam engelleyiciyi kapatıp tekrar deneyin.',
  'Could not load recent activity.': 'Son etkinlikler yüklenemedi.',
  'Stellar returned an unknown transaction status. Wait a moment and check again.':
    'Stellar bilinmeyen bir işlem durumu döndürdü. Biraz bekleyip tekrar kontrol edin.',
  'You are offline. Reconnect before submitting this transaction.':
    'Çevrimdışısınız. Bu işlemi göndermeden önce yeniden bağlanın.',
  'Something interrupted this transaction. Check its status before continuing.':
    'Bir şey bu işlemi yarıda kesti. Devam etmeden önce durumunu kontrol edin.',
}

const TR_TO_EN = new Map(Object.entries(EN_TO_TR).map(([english, turkish]) => [turkish, english]))

const dynamicPairs: Array<[RegExp, string, RegExp, string]> = [
  [/^Available: (.+)$/u, 'Kullanılabilir: $1', /^Kullanılabilir: (.+)$/u, 'Available: $1'],
  [/^Loading (.+)…$/u, '$1 yükleniyor…', /^(.+) yükleniyor…$/u, 'Loading $1…'],
  [/^Get (.+)$/u, '$1 al', /^(.+) al$/u, 'Get $1'],
  [/^Sending (.+)…$/u, '$1 gönderiliyor…', /^(.+) gönderiliyor…$/u, 'Sending $1…'],
  [
    /^Confirm return to (.+)$/u,
    '$1 varlığına dönüşü onayla',
    /^(.+) varlığına dönüşü onayla$/u,
    'Confirm return to $1',
  ],
  [/^Get (.+)$/u, '$1 alın', /^(.+) alın$/u, 'Get $1'],
  [
    /^Everspan prepares your (.+) the first time you choose an outcome\.$/u,
    'Everspan, bir hedef seçtiğinizde $1 varlığınızı ilk seferde hazırlar.',
    /^Everspan, bir hedef seçtiğinizde (.+) varlığınızı ilk seferde hazırlar\.$/u,
    'Everspan prepares your $1 the first time you choose an outcome.',
  ],
  [
    /^Wallet connected to (.+)\. Account (.+)\.$/u,
    'Cüzdan $1 piyasasına bağlandı. Hesap $2.',
    /^Cüzdan (.+) piyasasına bağlandı\. Hesap (.+)\.$/u,
    'Wallet connected to $1. Account $2.',
  ],
  [/^Copy address (.+)$/u, '$1 adresini kopyala', /^(.+) adresini kopyala$/u, 'Copy address $1'],
  [/^Lock (.+) APY$/u, '%$1 APY kilitle', /^%(.+) APY kilitle$/u, 'Lock $1 APY'],
  [/^(.+) failed$/u, '$1 başarısız', /^(.+) başarısız$/u, '$1 failed'],
  [
    /^Amount exceeds your (.+) \((.+)\)\.$/u,
    'Tutar $1 bakiyenizi aşıyor ($2).',
    /^Tutar (.+) bakiyenizi aşıyor \((.+)\)\.$/u,
    'Amount exceeds your $1 ($2).',
  ],
  [
    /^You don’t have enough (.+) for that\.$/u,
    'Bunun için yeterli $1 bakiyeniz yok.',
    /^Bunun için yeterli (.+) bakiyeniz yok\.$/u,
    'You don’t have enough $1 for that.',
  ],
  [/^(\d+)m ago$/u, '$1 dk önce', /^(\d+) dk önce$/u, '$1m ago'],
  [/^(\d+)h ago$/u, '$1 sa önce', /^(\d+) sa önce$/u, '$1h ago'],
  [/^(\d+)d ago$/u, '$1 gün önce', /^(\d+) gün önce$/u, '$1d ago'],
  [/^(\d+)d$/u, '$1g', /^(\d+)g$/u, '$1d'],
  [/\bstep 1 of 2\b/u, '2 adımın 1.si', /\b2 adımın 1\.si\b/u, 'step 1 of 2'],
  [/\bstep 2 of 2\b/u, '2 adımın 2.si', /\b2 adımın 2\.si\b/u, 'step 2 of 2'],
  [
    /\bAvailable yield\b/u,
    'Kullanılabilir getiri',
    /\bKullanılabilir getiri\b/u,
    'Available yield',
  ],
  [/\bJan\b/u, 'Oca', /\bOca\b/u, 'Jan'],
  [/\bFeb\b/u, 'Şub', /\bŞub\b/u, 'Feb'],
  [/\bMar\b/u, 'Mar', /\bMar\b/u, 'Mar'],
  [/\bApr\b/u, 'Nis', /\bNis\b/u, 'Apr'],
  [/\bMay\b/u, 'May', /\bMay\b/u, 'May'],
  [/\bJun\b/u, 'Haz', /\bHaz\b/u, 'Jun'],
  [/\bJul\b/u, 'Tem', /\bTem\b/u, 'Jul'],
  [/\bAug\b/u, 'Ağu', /\bAğu\b/u, 'Aug'],
  [/\bSep\b/u, 'Eyl', /\bEyl\b/u, 'Sep'],
  [/\bOct\b/u, 'Eki', /\bEki\b/u, 'Oct'],
  [/\bNov\b/u, 'Kas', /\bKas\b/u, 'Nov'],
  [/\bDec\b/u, 'Ara', /\bAra\b/u, 'Dec'],
]

export function translateUiText(input: string, language: Language): string {
  const leading = input.match(/^\s*/u)?.[0] ?? ''
  const trailing = input.match(/\s*$/u)?.[0] ?? ''
  const core = input.slice(leading.length, input.length - trailing.length).replace(/\s+/gu, ' ')
  if (!core) return input

  const exact = language === 'tr' ? EN_TO_TR[core] : TR_TO_EN.get(core)
  if (exact) return `${leading}${exact}${trailing}`

  let dynamic = core
  for (const [english, turkish, reverseTurkish, reverseEnglish] of dynamicPairs) {
    const source = language === 'tr' ? english : reverseTurkish
    dynamic = dynamic.replace(source, language === 'tr' ? turkish : reverseEnglish)
  }
  if (dynamic !== core) return `${leading}${dynamic}${trailing}`
  return input
}
