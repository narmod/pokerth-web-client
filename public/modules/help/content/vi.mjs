// ── help/content/vi.mjs — Kho trợ giúp tiếng Việt ───────────────────────────
// Dịch từ en.mjs (bản tham chiếu). Cấu trúc và id giống hệt; chỉ dịch
// t / b / list / keys (nhãn) / note. Các thuật ngữ poker (Fold, Check, Call,
// Bet, Raise, All-In, flop, turn, river…) giữ nguyên tiếng Anh theo quy ước
// của ứng dụng. Xưng hô: bạn.
export const help = {
  chapters: [
    {
      id: 'start', icon: '\uD83D\uDE80', title: 'Bắt đầu',
      sections: [
        { id: 'modes', t: 'Ba cách chơi',
          b: ['Ở màn hình đăng nhập, hãy chọn bạn muốn chơi thế nào.'],
          list: [
            'Internet — chơi trực tuyến trên máy chủ chính thức pokerth.net, có bảng xếp hạng. Cần một tài khoản pokerth.net; đăng ký tại pokerth.net là miễn phí.',
            'Cục bộ / luyện tập — chơi ngoại tuyến với bot. Không phải thiết lập gì, chạy được khi không có kết nối và mở khóa cúp khi bạn tiến bộ.',
            'LAN / máy chủ riêng — kết nối tới một máy chủ PokerTH riêng trong mạng nội bộ hoặc trên chính máy của bạn.'] },
        { id: 'lan', t: 'LAN / máy chủ riêng',
          b: ['Chế độ thứ ba kết nối tới bất kỳ máy chủ PokerTH nào mà bạn hoặc một người bạn đang chạy — trên mạng gia đình, trên VPS riêng, ở đâu cũng được. Nhập địa chỉ và cổng của máy chủ, đánh dấu TLS nếu máy chủ dùng cổng mã hóa, rồi đăng nhập bằng biệt danh (đăng nhập khách vẫn được nếu máy chủ cho phép). Sau đó tại bàn, mọi thứ hoạt động y hệt như trên máy chủ chính thức.'] },
        { id: 'famboard', t: 'Bảng xếp hạng gia đình',
          b: ['Chỉ trên máy chủ riêng và ván LAN, ứng dụng mới lưu thống kê tích lũy theo biệt danh — số ván bài và ván đấu đã chơi và đã thắng, khoản thắng lớn nhất, chuỗi thắng tốt nhất — rồi chia sẻ qua máy chủ, để mọi thiết bị quanh bàn đều thấy cùng một bảng xếp hạng. Các ván trên pokerth.net không bao giờ được ghi nhận theo cách này, và thống kê của chế độ luyện tập được giữ hoàn toàn riêng biệt.'] },
        { id: 'language', t: 'Ngôn ngữ',
          b: ['Giao diện có sẵn ở 36 ngôn ngữ. Hãy đổi bất cứ lúc nào trong Tùy chọn nâng cao (menu bánh răng), mục Giao diện người dùng. Các thuật ngữ hành động của poker (Fold, Check, Call, Bet, Raise, All-In) vẫn giữ tiếng Anh theo quy ước, đúng như ứng dụng máy tính để bàn.'] },
        { id: 'pwa', t: 'Cài đặt như một ứng dụng',
          b: ['Ứng dụng này là một Progressive Web App: bạn có thể cài từ menu của trình duyệt (hoặc nút cài đặt trên thanh tiêu đề) để có một ứng dụng toàn màn hình với biểu tượng riêng. Sau khi cài, nó khởi động tức thì và chế độ luyện tập chạy hoàn toàn ngoại tuyến.'],
          note: 'Trên Android và Chrome/Edge máy tính, nút cài đặt lo hết mọi thứ. Trên iPhone/iPad, Apple chỉ cho phép cài qua Safari: nút Chia sẻ \u2192 \u201cThêm vào Màn hình chính\u201d — ứng dụng sẽ hiện các bước này khi cần. Nút biến mất ngay khi đã cài xong.' },
        { id: 'platforms', t: 'Nền tảng và trình duyệt',
          b: ['Ứng dụng chạy trên mọi trình duyệt hiện đại, mọi hệ điều hành — Windows, macOS, Linux, Android, iOS. Vài tính năng phụ thuộc vào các API trình duyệt mới; khi thiếu một API, tính năng sẽ ẩn đi hoặc giải thích thay vì hỏng. Những khác biệt chính nên biết:'],
          list: [
            'Chrome / Edge (máy tính): mọi thứ đều chạy, kể cả ghi nhật ký .pdb vào một thư mục.',
            'Firefox: mọi thứ trừ ghi .pdb vào thư mục (API chưa có).',
            'Safari / iOS: cài đặt qua Chia sẻ \u2192 \u201cThêm vào Màn hình chính\u201d; không rung; toàn màn hình bị hạn chế trên iPhone; âm thanh bắt đầu sau lần chạm đầu tiên của bạn.',
            'Android: hỗ trợ đầy đủ trên các trình duyệt Chromium, kể cả rung và hành vi của nút Quay lại.'] },
        { id: 'avatar', t: 'Biệt danh và ảnh đại diện',
          b: ['Hãy chọn biệt danh và ảnh đại diện ở màn hình đăng nhập trước khi kết nối. Trên pokerth.net, biệt danh chính là tên tài khoản của bạn; ảnh đại diện được chia sẻ với người chơi khác qua máy chủ ảnh đại diện.'] }
      ]
    },
    {
      id: 'rules', icon: '\uD83C\uDCCF', title: 'Luật poker',
      sections: [
        { id: 'basics', t: 'Texas Hold\u2019em tóm tắt',
          b: ['PokerTH chơi theo thể thức No-Limit Texas Hold\u2019em. Mỗi người chơi nhận hai lá úp (hole cards). Sau đó năm lá chung được đặt ngửa ở giữa bàn. Bộ năm lá mạnh nhất tạo từ bất kỳ kết hợp nào giữa hai lá của bạn và năm lá chung sẽ thắng pot.'] },
        { id: 'blinds', t: 'Blind và nút chia bài',
          b: ['Trước mỗi ván bài, hai khoản cược bắt buộc nuôi pot: small blind và big blind, do hai người ngồi bên trái nút chia bài đặt. Sau mỗi ván bài, nút dịch một chỗ theo chiều kim đồng hồ, nên ai cũng lần lượt trả blind. Blind tăng theo những khoảng đều đặn trong suốt ván đấu.',
              'Trên bàn, nút và các blind được đánh dấu bằng phỉnh: D (người chia), SB (small blind), BB (big blind).'] },
        { id: 'streets', t: 'Bốn vòng cược',
          list: [
            'Pre-flop — sau khi chia bài úp, vòng cược đầu tiên bắt đầu từ bên trái big blind.',
            'Flop — ba lá chung được lật, tiếp theo là một vòng cược.',
            'Turn — lá chung thứ tư, rồi thêm một vòng cược nữa.',
            'River — lá chung thứ năm và cuối cùng, rồi vòng cược cuối.'],
          b: ['Một vòng cược kết thúc khi mọi người còn trong ván bài đã bỏ vào pot cùng một số tiền (hoặc đã all-in).'] },
        { id: 'actions', t: 'Bạn có thể làm gì khi đến lượt',
          list: [
            'Fold — bỏ bài. Lá bài của bạn bị loại và bạn không còn tranh pot nữa.',
            'Check — đi tiếp mà không cược. Chỉ được khi không có gì phải trả.',
            'Call — theo đúng mức cược hiện tại.',
            'Bet — mở cược khi chưa ai đặt cược ở street này.',
            'Raise — nâng lên trên một khoản cược đã có. Mức nâng tối thiểu bằng khoản cược hoặc lần nâng trước đó.',
            'All-In — đặt toàn bộ chồng phỉnh. Bạn còn trong ván bài đến mức tiền mà bạn đã bù được.'] },
        { id: 'showdown', t: 'Showdown và pot chia',
          b: ['Nếu sau vòng cược ở river vẫn còn nhiều người, các bộ bài được lật và bộ mạnh nhất thắng — bộ thắng hiện ngay dưới các lá chung. Khi một người all-in với số tiền ít hơn mức cược đầy đủ, các pot phụ hình thành: mỗi người chỉ có thể thắng phần pot mà mình đã góp. Các bộ bài ngang nhau chia đôi pot.'] },
        { id: 'hands', t: 'Thứ bậc các bộ bài',
          b: ['Từ yếu nhất đến mạnh nhất:'],
          list: [
            '1. High Card — không có bộ nào; lá cao nhất quyết định.',
            '2. Pair — hai lá cùng giá trị.',
            '3. Two Pair — hai đôi khác nhau.',
            '4. Three of a Kind — ba lá cùng giá trị.',
            '5. Straight — năm lá liên tiếp (át tính cao hoặc thấp).',
            '6. Flush — năm lá cùng chất.',
            '7. Full House — một bộ ba cộng một đôi.',
            '8. Four of a Kind — bốn lá cùng giá trị.',
            '9. Straight Flush — một dãy liên tiếp, toàn cùng một chất.',
            '10. Royal Flush — từ mười đến át trong cùng một chất. Bộ bài mạnh nhất có thể có.'] },
      ]
    },
    {
      id: 'game', icon: '\uD83C\uDFAE', title: 'Màn hình chơi',
      sections: [
        { id: 'actionbar', t: 'Thanh hành động',
          b: ['Khi đến lượt bạn, thanh hành động phía dưới sáng lên với tối đa bốn nút: Fold (đỏ), Check / Call (xanh dương), Bet / Raise (xanh lá — hành động chính, được làm nổi) và All-In (đỏ sẫm). Nút Check / Call hiển thị đúng số tiền phải trả; Bet / Raise hiển thị số tiền bạn sắp bỏ vào. Sau river, All-In có thể biến thành nút Show để lật bài của bạn.'] },
        { id: 'betctl', t: 'Chọn mức cược',
          b: ['Điều chỉnh mức nâng bằng ô số, thanh trượt hoặc các nút nhanh 1/3 \u00b7 1/2 \u00b7 Pot (các phần của pot hiện tại). Số tiền được làm tròn tự động và luôn nằm giữa mức nâng tối thiểu và tối đa được phép. Nếu bạn quen nghĩ theo big blind, một tùy chọn sẽ hiển thị mọi số tiền theo BB thay vì phỉnh.'] },
        { id: 'preselect', t: 'Chọn trước một hành động',
          b: ['Trước lượt của mình, bạn có thể nạp sẵn một hành động: chạm vào một nút và nút đó sẽ có viền vàng cùng một chấm vàng nhỏ ở góc trên bên phải. Khi đến lượt, hành động chạy ngay lập tức. Fold đã nạp sẵn sẽ tự thành Check khi check là miễn phí — bạn không bao giờ bỏ bài vô ích. Lựa chọn trước được đặt lại ở mỗi ván bài mới, mỗi lần đổi street và ở showdown, và bị hủy nếu tình huống thay đổi (chẳng hạn số tiền phải trả thay đổi).'] },
        { id: 'automodes', t: 'Chế độ tự động',
          b: ['Danh sách thả xuống bên cạnh các nút hành động cho ba chế độ chơi: Thủ công, Auto Check/Call và Auto Check/Fold. Các chế độ tự động chơi thay bạn cho đến khi bạn chuyển lại — bất kỳ cú nhấp thủ công nào lên một hành động đều lập tức đưa về Thủ công.'] },
        { id: 'readtable', t: 'Đọc bàn chơi',
          b: ['Mỗi ô người chơi hiển thị ảnh đại diện, tên, chồng phỉnh và mức cược hiện tại. Người chia và các blind được đánh dấu bằng phỉnh D / SB / BB. Một huy hiệu màu trên ô cho biết hành động gần nhất của người đó; một vạch xanh mảnh đếm ngược thời gian suy nghĩ của họ. Ô của người đến lượt sẽ sáng lên; ô của chính bạn có khung vàng nhấp nháy khi đến lượt bạn.',
              'Thanh trạng thái phía trên bàn hiển thị tổng pot, các khoản cược của street hiện tại, giai đoạn (Pre-flop, Flop, Turn, River) cùng số ván đấu và số ván bài. Người đã bỏ bài có lá bài mờ đi; người bị loại thì tối lại. Cuối mỗi ván bài, cửa sổ người thắng có thể tóm tắt ai thắng gì — có thể tắt trong tùy chọn.'] },
        { id: 'seatlayout', t: 'Cách sắp xếp chỗ ngồi',
          b: ['Là một phần mở rộng web, cách bố trí các ô người chơi được chọn ở Tùy chọn nâng cao \u2192 Chỗ ngồi: Tự động theo ứng dụng chính thức (vị trí cố định khi dọc, hình elip tính toán khi ngang), hoặc buộc bố cục Dọc hay Ngang — còn Tùy chỉnh cho phép bạn tự đặt từng chỗ: một chế độ chỉnh sửa xuất hiện, bạn kéo từng ô đến đúng nơi mình muốn, và bố cục được lưu lại.'] },
        { id: 'zoom', t: 'Phóng to bàn (điện thoại)',
          b: ['Trên màn hình nhỏ, các nút kính lúp phóng to bàn (2\u00d7) và bạn có thể kéo bằng ngón tay — ô của bạn và thanh hành động vẫn đứng yên. Khung nhìn tự động bám theo chỗ đang hành động và thu nhỏ lại ở showdown để nhìn toàn cảnh. Có thể tắt trong Tùy chọn nâng cao.'],
          note: 'Trên điện thoại và máy tính bảng, thao tác chụm để phóng to của chính trình duyệt bị chặn theo mặc định, để cử chỉ phóng to không bao giờ vô tình kích hoạt giữa ván bài; bật lại ở Tùy chọn nâng cao \u2192 Giao diện người dùng nếu bạn thích thế.' },
        { id: 'protections', t: 'Chống nhìn trộm và chống Call nhầm',
          b: ['Hai lớp bảo vệ tùy chọn: chống nhìn trộm giữ bài của bạn úp cho đến khi bạn chạm vào (hữu ích khi có người thấy được màn hình), còn chống Call nhầm khóa nút Call trong chốc lát ngay sau một lần nâng lớn, để cú chạm định dành cho một Call nhỏ hơn không vô tình rơi vào số tiền đã nâng. Cả hai đều nằm trong Tùy chọn nâng cao.'] }
      ]
    },
    {
      id: 'info', icon: '\uD83D\uDCCA', title: 'Bảng thông tin',
      sections: [
        { id: 'open', t: 'Mở bảng',
          b: ['Trong ván đấu, bảng thông tin mở từ thanh tiêu đề (hoặc Alt+L / Alt+I) và có ba thẻ: Nhật ký, Xác suất và Thống kê. Trên điện thoại nó nổi trên bàn; trên màn hình lớn hơn, đó là một cửa sổ di chuyển và đổi kích thước được — nắm tay cầm \u28ff để di chuyển, các cạnh để đổi kích thước. Vị trí được ghi nhớ.'] },
        { id: 'log', t: 'Nhật ký ván đấu',
          b: ['Thẻ Nhật ký ghi lại toàn bộ ván đấu theo từng ván bài: các blind, từng hành động kèm số tiền, các lá đã lật và người thắng, tất cả đều được tô màu để đọc nhanh. Nút xuất lưu nhật ký thành tệp nếu bạn muốn xem lại một phiên sau này.'] },
        { id: 'odds', t: 'Xác suất (bộ theo dõi xác suất)',
          b: ['Thẻ Xác suất hiển thị theo thời gian thực, cho bộ bài hiện tại của bạn, khả năng kết thúc với từng loại trong 10 loại bộ bài — từ High Card đến Royal Flush — mỗi loại có biểu tượng, phần trăm và thanh. Hiển thị mờ đi ngay khi bạn bỏ bài. Nó chỉ dùng lá bài của bạn và các lá chung: nó không thấy bất cứ thứ gì đối thủ không lật ra.'] },
        { id: 'journal', t: 'Nhật ký ván bài và cửa sổ \u201cNhật ký\u201d',
          b: ['Ngoài nhật ký trực tiếp, mỗi ván bài bạn chơi đều được ghi cục bộ trong trình duyệt, đúng định dạng tệp nhật ký .pdb của ứng dụng chính thức. Cửa sổ Nhật ký (Tùy chọn nâng cao \u2192 Thông điệp nhật ký \u2192 Quản lý nhật ký\u2026) liệt kê các phiên của bạn và cho phép làm việc với chúng: xem trước một phiên kèm tìm kiếm và tô sáng, lọc theo ván đấu, xuất ra HTML hoặc văn bản thuần, lưu tệp .pdb gốc, hoặc nhập một tệp .pdb do ứng dụng máy tính ghi lại. Các phiên có thể xóa từng cái hoặc tất cả cùng lúc (có xác nhận), và chế độ lưu giữ tự động có thể chỉ giữ 7, 30, 90, 180 hoặc 365 ngày gần nhất. Nhật ký bạn tự nhập sẽ không bao giờ bị xóa tự động. Một thiết lập thứ hai giới hạn số phiên được giữ, và cột danh sách có thể kéo rộng ra.',
              'Nút Phân tích chạy phân tích ván bài trên một phiên và có thể gửi nhật ký tới dịch vụ phân tích của pokerth.net. Mọi thứ vẫn nằm trên thiết bị của bạn cho đến khi bạn chủ động xuất hoặc gửi đi.'] },
        { id: 'logopts', t: 'Tùy chọn nhật ký',
          b: ['Trong Tùy chọn nâng cao \u2192 Thông điệp nhật ký, bạn có thể bật hoặc tắt việc ghi và chọn nhịp ghi (sau mỗi hành động, hoặc một lần mỗi ván bài), giống như trong cài đặt của ứng dụng máy tính. Một tùy chọn bổ sung ghi tệp .pdb trực tiếp vào thư mục bạn chọn và cập nhật sau mỗi ván bài — đúng như ứng dụng máy tính vẫn làm, để các công cụ khác đọc được theo thời gian thực.'],
          note: 'Việc ghi vào thư mục cục bộ cần API File System Access: chỉ Chrome và Edge trên máy tính. Firefox, Safari và trình duyệt di động không làm được — khi đó tùy chọn hiện một giải thích ngắn, còn việc xuất thủ công từ cửa sổ Nhật ký vẫn dùng được ở mọi nơi.' },
        { id: 'assist', t: 'Trợ lý (sức mạnh bài)',
          b: ['Ở đầu thẻ Xác suất, dải trợ lý đọc bộ bài giúp bạn. Trước flop, nó gọi tên bộ bài khởi đầu và chấm điểm bằng sao; từ flop trở đi, nó hiển thị bộ tốt nhất hiện tại của bạn và, sau một mô phỏng nhanh, ước lượng khả năng thắng ván bài theo phần trăm, kèm chỉ báo màu từ đỏ (yếu) đến xanh lá (mạnh). Giống bộ theo dõi xác suất, nó chỉ dùng thông tin mà bạn nhìn thấy được.',
              'Hai kiểu hiển thị nằm ở Tùy chọn nâng cao \u2192 Chỗ ngồi: Phân đoạn (mười khối) hoặc thanh tiến trình cổ điển. Toàn bộ tính năng trợ lý có thể tắt ở Tùy chọn nâng cao \u2192 Trợ lý.'] },
        { id: 'assistwin', t: 'Trợ lý dưới dạng cửa sổ nổi',
          b: ['Khối trợ lý có thể tách khỏi bảng thành một cửa sổ nhỏ riêng luôn nằm trên cùng: dùng nút tách trên khối, rồi di chuyển và đổi kích thước tùy ý phía trên bàn — tiện để theo dõi sức mạnh bài mà không cần mở cả bảng. Nút gắn lại đưa nó về thẻ Xác suất, và vị trí được ghi nhớ. Bên trong bảng, tay kéo giữa Trợ lý và phần xác suất cho phép bạn chia không gian giữa hai phần.'] },
        { id: 'stats', t: 'Thống kê',
          b: ['Thẻ Thống kê theo dõi phiên chơi của bạn: số ván bài đã chơi, số flop đã thấy, số showdown, tỉ lệ thắng và hơn thế nữa. Việc theo dõi thống kê có thể tắt trong Tùy chọn nâng cao.'] },
        { id: 'hud', t: 'HUD thống kê tại chỗ ngồi (thử nghiệm)',
          b: ['HUD gắn một ô thống kê nhỏ cạnh chỗ ngồi của từng người chơi, dựng từ những ván bài đã ghi trong nhật ký của bạn: số ván bài quan sát được, rồi VPIP (mức độ thường xuyên tự nguyện bỏ tiền pre-flop), PFR (số lần nâng pre-flop), AF (hệ số hung hăng), 3B (3-bet), CB (continuation bet) và F3B (fold trước 3-bet), có mã màu từ thụ động đến hung hăng. Chạm vào một ô để mở cửa sổ chi tiết với nhiều con số hơn (số lần steal, fold trước steal, tỉ lệ showdown\u2026), và kéo nó đi nếu nó che mất thứ gì.',
              'HUD chỉ biết những gì bạn đã thấy tại bàn của chính mình — nó đọc nhật ký ván bài cục bộ, nên việc ghi phải đang bật, và các con số chỉ có ý nghĩa sau đủ nhiều ván bài. Đây là tính năng thử nghiệm, mặc định tắt: hãy bật ở Tùy chọn nâng cao \u2192 Trợ lý.'] },
        { id: 'handsbtn', t: 'Xem nhanh các bộ bài',
          b: ['Biểu tượng bộ bài poker trên mặt bàn mở bảng tóm tắt nhanh 10 bộ bài bất cứ lúc nào — tiện khi đang học. Có thể ẩn trong Tùy chọn nâng cao.'] }
      ]
    },
    {
      id: 'chat', icon: '\uD83D\uDCAC', title: 'Trò chuyện và cộng đồng',
      sections: [
        { id: 'panels', t: 'Trò chuyện sảnh và trò chuyện bàn',
          b: ['Có một khung trò chuyện ở sảnh và một khung khác ở bàn. Trên điện thoại, khung trò chuyện của bàn nổi trên ván đấu; trên màn hình lớn hơn, đó là cửa sổ di chuyển và đổi kích thước được. Một huy hiệu trên nút trò chuyện đếm số tin chưa đọc.'] },
        { id: 'typing', t: 'Hỗ trợ gõ',
          list: [
            'Tab hoàn tất một biệt danh — nhấn Tab lần nữa để duyệt qua các kết quả khớp.',
            '\u2191 / \u2193 lật lại lịch sử tin nhắn của chính bạn.',
            'Nút emoji mở bộ chọn đầy đủ; gõ : cũng gợi ý emote ngay khi bạn đang nhập.'] },
        { id: 'emotes', t: 'Emote và mặt cười',
          b: ['Khung trò chuyện chuyển mã emote đúng như ứng dụng máy tính chính thức: viết một tên giữa hai dấu hai chấm và nó thành emoji — :sunny: \u2192 \u2600, :+1: \u2192 \uD83D\uDC4D, :joy: \u2192 \uD83D\uDE02, :four_leaf_clover: \u2192 \uD83C\uDF40\u2026 hơn 1.900 mã được hỗ trợ (toàn bộ tập hợp của GitHub). Các mặt cười bằng ký tự cổ điển cũng được chuyển: :-) ;) :D xD :P <3 và khoảng tám mươi mã khác.',
              'Gõ : sẽ mở hộp gợi ý hoàn tất mã ngay khi bạn nhập (\u2191/\u2193 để chọn, Tab hoặc Enter để chấp nhận). Việc chuyển emoji có thể tắt hoàn toàn ở Tùy chọn nâng cao \u2192 Trò chuyện.'] },
        { id: 'commands', t: 'Lệnh trò chuyện',
          b: ['Khung trò chuyện hiểu các lệnh gạch chéo. Hai lệnh hiện ra cho người khác thấy:'],
          keys: [
            ['/me <văn bản>', 'Tin nhắn hành động, hiển thị dạng \u201c* biệtdanhcủabạn văn bản\u201d'],
            ['/emoji <emoji>', 'Phát một phản ứng emoji (đúng thứ mà bộ chọn phản ứng gửi đi)']] },
        { id: 'diagcmds', t: 'Lệnh chẩn đoán',
          b: ['Tất cả những lệnh còn lại đều cục bộ: chỉ bạn thấy phản hồi và không có gì được gửi tới bàn. Gõ /help để liệt kê tất cả. Những lệnh hữu ích nhất:'],
          keys: [
            ['/help', 'Liệt kê mọi lệnh'],
            ['/update', 'Kiểm tra phiên bản mới và tải lại'],
            ['/lang <mã>', 'Đổi ngôn ngữ (ví dụ /lang vi)'],
            ['/sound on|off', 'Bật/tắt tiếng của ván đấu'],
            ['/zoom', 'Bật tắt kính lúp của bàn'],
            ['/clear', 'Xóa khung trò chuyện cục bộ'],
            ['/table', 'Thông tin ván đấu hiện tại (blind, người chơi, chồng phỉnh)'],
            ['/diag \u00b7 /netdbg \u00b7 /fps', 'Chẩn đoán trạng thái ứng dụng, mạng và độ mượt'],
            ['/carddbg \u00b7 /msglog \u00b7 /audiodbg \u00b7 /storage \u00b7 /logdump \u00b7 /seatdbg', 'Gỡ lỗi nâng cao (lá bài, giao thức, âm thanh, lưu trữ, chỗ ngồi)'],
            ['/copy', 'Chép phản hồi lệnh gần nhất vào bộ nhớ tạm']] },
        { id: 'reactions', t: 'Phản ứng emoji',
          b: ['Nút phản ứng mở bộ chọn gồm 30 phản ứng động (\uD83C\uDF89, \uD83D\uDE02, \uD83D\uDE31, \uD83D\uDD25\u2026) được phát kèm hiệu ứng phía trên chỗ ngồi của bạn, cả bàn đều thấy — kể cả người chơi trên ứng dụng máy tính. Phản ứng có thể tắt hoàn toàn trong Tùy chọn nâng cao.'] },
        { id: 'translate', t: 'Hiểu được mọi người',
          b: ['Khi bật dịch trò chuyện, mỗi tin nhắn có thêm một nút dịch để hiển thị nó bằng ngôn ngữ của bạn, thông qua bộ dịch của trình duyệt. Các từ viết tắt thường gặp ở bàn (gg, nh, utg\u2026) được giải thích trong chú giải khi rê chuột lên — cả hai tùy chọn nằm ở Tùy chọn nâng cao \u2192 Trò chuyện.'],
          note: 'Việc dịch dùng dịch vụ Google Translate và chạy trên mọi trình duyệt — chỉ cần kết nối internet. Một tin nhắn chỉ được gửi tới dịch vụ dịch khi bạn chạm nút dịch của nó, không bao giờ tự động.' },
        { id: 'social', t: 'Người chơi: hồ sơ, mời, bỏ qua',
          b: ['Chạm vào bất kỳ người chơi nào — ở bàn hoặc trong danh sách sảnh — để mở thẻ của họ: hồ sơ và thống kê, mời vào ván đấu của bạn, hoặc bỏ qua (tin nhắn trò chuyện của họ bị ẩn; có thể hoàn tác bất cứ lúc nào). Có thể bật xác nhận trước khi mời/bỏ qua trong tùy chọn.'] }
      ]
    },
    {
      id: 'lobby', icon: '\uD83C\uDFDB\uFE0F', title: 'Sảnh và ván đấu',
      sections: [
        { id: 'list', t: 'Danh sách ván đấu',
          b: ['Sảnh liệt kê mọi bàn trên máy chủ. Mỗi dòng hiển thị số người chơi, loại ván đấu, một ổ khóa khi cần mật khẩu hay lời mời, và một huy hiệu trạng thái: \u201cĐang chờ\u201d (xanh lá — ván đấu chưa bắt đầu, bạn vào được nếu còn chỗ), \u201cĐang diễn ra\u201d (màu ấm — xem trực tiếp được khi cho phép khán giả) và \u201cĐã đóng\u201d (mờ). Bàn đầy nhận ra đơn giản qua bộ đếm đã đầy, kiểu 10/10; màu huy hiệu đi theo chủ đề đang dùng.',
              'Danh sách lọc thu hẹp danh sách đúng như ứng dụng máy tính, mỗi lựa chọn chặt hơn lựa chọn trước: chỉ ván đang mở \u2192 đồng thời ẩn bàn đầy \u2192 rồi chỉ ván không riêng tư, chỉ ván riêng tư, hoặc chỉ ván xếp hạng. Lựa chọn của bạn được ghi nhớ. Ô tìm kiếm tìm ván đấu theo tên, còn huy hiệu người chơi mở danh sách tất cả người đang trực tuyến, có thể tìm và sắp xếp.'] },
        { id: 'join', t: 'Tham gia và xem',
          b: ['Chọn một ván đang mở rồi tham gia — ổ khóa cho biết cần mật khẩu. Những ván đang diễn ra mà cho phép khán giả thì xem trực tiếp được: bạn thấy bàn và khung trò chuyện, nhưng các lá úp vẫn ẩn và bạn không thể hành động.'] },
        { id: 'gameinfo', t: 'Thông tin ván đấu',
          b: ['Trước khi tham gia, thẻ thông tin ván đấu cho thấy mọi thứ định hình bàn chơi: loại ván đấu, các blind và cách chúng tăng (nhân đôi hoặc danh sách thủ công), chồng phỉnh khởi đầu, thời gian hành động, khoảng nghỉ giữa các ván bài, và những ai đã ngồi vào.'] },
        { id: 'create', t: 'Tạo ván đấu',
          b: ['Hãy tạo bàn của riêng bạn: tên, số người chơi, chồng phỉnh khởi đầu, small blind đầu tiên và lịch tăng, thời gian hành động, và có cho phép khán giả hay không. Có bốn loại ván đấu: Thường (mọi người), chỉ người chơi đã đăng ký, chỉ theo lời mời, và Xếp hạng (tính vào bảng xếp hạng chính thức — khi đó không đặt được mật khẩu). Các thiết lập ưa thích có thể lưu lại và tải lên dùng lại.'] },
        { id: 'invites', t: 'Lời mời',
          b: ['Người chơi có thể mời bạn tới bàn của họ; bạn nhận được thông báo và có thể chấp nhận hoặc từ chối. Được mời là cách duy nhất để vào một ván đấu chỉ theo lời mời.'] }
      ]
    },
    {
      id: 'pthnet', icon: '\uD83C\uDF10', title: 'pokerth.net',
      sections: [
        { id: 'account', t: 'Tài khoản của bạn',
          b: ['Máy chủ internet chính thức là pokerth.net. Chơi ở đó cần một tài khoản pokerth.net miễn phí — hãy đăng ký trên trang web, rồi đăng nhập tại đây bằng chính biệt danh và mật khẩu đó. Ứng dụng web này kết nối tới đúng máy chủ mà ứng dụng máy tính vẫn dùng: cùng tài khoản, cùng bàn chơi, cùng bảng xếp hạng, và bạn có thể ngồi cùng bàn với người chơi dùng ứng dụng máy tính.'] },
        { id: 'ranked', t: 'Ván xếp hạng và mùa giải',
          b: ['Các ván đấu loại Xếp hạng được tính vào bảng xếp hạng chính thức của mùa. Hồ sơ trong ứng dụng hiển thị ngày đăng ký, Rank mùa hiện tại, Score, mức trung bình và số ván đã chơi của bạn, cùng những kết quả gần nhất. Ván thường (không xếp hạng) chỉ để vui và không thay đổi điều gì.'] },
        { id: 'rankhow', t: 'Cách tính bảng xếp hạng',
          b: ['Trong mỗi ván xếp hạng, thứ hạng của bạn mang lại điểm: 15 cho hạng nhất, rồi 9, 6, 4, 3, 2 và 1 cho đến hạng bảy; từ hạng tám đến hạng mười thì không có gì. Vậy một bàn chia ra tổng cộng 40 điểm.',
              'Score của bạn không phải tổng số điểm đó, mà là trung bình mỗi ván, được điều tiết bởi một hệ số tăng theo số ván đã chơi: vài kết quả tốt không đủ để trụ lại trên đỉnh, còn cần cả sự đều đặn — càng chơi nhiều, Score càng tiến gần trung bình thật của bạn. Mỗi mùa kéo dài một quý: khi chuyển mùa, mọi thứ được lưu trữ và các bộ đếm bắt đầu lại từ không, còn các mùa trước vẫn xem được. Trong ván đấu, nút bục vinh danh cho thấy thứ hạng mùa của những người chơi cùng bàn với bạn.'],
          note: 'Thang điểm và công thức chính xác do máy chủ xếp hạng của pokerth.net quy định và có thể thay đổi; các trang trên trang web mới là căn cứ.' },
        { id: 'rankings', t: 'Trang xếp hạng',
          b: ['Mục xếp hạng mở bảng xếp hạng chính thức của PokerTH, tìm được theo người chơi, cùng các bảng xếp hạng cộng đồng (BBC, WEC). Nếu bạn không quan tâm tới xếp hạng, mục này có thể ẩn ở Tùy chọn nâng cao \u2192 Cộng đồng.'] },
        { id: 'cups', t: 'Các cúp cộng đồng: BBC và WeCup',
          b: ['Hai cộng đồng tổ chức giải riêng của mình trên pokerth.net, mỗi bên có trang web và bảng xếp hạng riêng. Best Brainies Cup (BBC) là giải đấu theo bậc ra đời năm 2013: bạn đi từ Step 1 lên Step 4, và một mùa mới bắt đầu sau mỗi ván Step 4, khi chiếc cúp được trao. WeCup (WEC) có thang điểm riêng, trải rộng hơn nhiều — 75 điểm cho hạng nhất, rồi 45, 30, 20… — và score của nó chuẩn hóa trung bình của bạn theo số ván bạn đã chơi so với các thành viên khác.',
              'Cả hai bảng xếp hạng đều mở từ nút cúp, ngay cạnh bảng xếp hạng PokerTH. Thiết lập bàn của các giải này có sẵn dưới dạng thiết lập sẵn khi bạn tạo ván đấu (BBC Step 1 đến 4, WEC, WEC Monthly Final và WEC Grand Final), nên bạn có thể luyện tập trong cùng điều kiện. Muốn tham gia thì phải đăng ký trên trang web của cúp tương ứng.'],
          note: 'Nếu không quan tâm đến các cúp, bạn ẩn toàn bộ nội dung này một lần trong Tùy chọn nâng cao → Cộng đồng.' },
        { id: 'forumcups', t: 'Cúp của diễn đàn và sự kiện',
          b: ['Diễn đàn pokerth.net còn tổ chức Monthly Cup, một chuỗi hằng tháng trong đó người chơi được chia về các bàn Gold, Silver và Bronze trước khi nhà vô địch của tháng được xướng tên, cùng với những cúp đặc biệt lẻ tẻ suốt cả năm.',
              'Đăng ký, lịch thi đấu, thiết lập bàn và kết quả đều được đăng trên diễn đàn, còn các ván đấu diễn ra trên máy chủ chính thức như mọi ván khác. Một tài khoản pokerth.net là đủ để theo dõi kết quả; đăng ký dự một cúp thì qua chủ đề tương ứng trên diễn đàn.'] },
        { id: 'avatars', t: 'Ảnh đại diện và cờ',
          b: ['Trên pokerth.net, ảnh đại diện của bạn được phân phối tới người chơi khác qua máy chủ ảnh đại diện, và một lá cờ quốc gia nhỏ có thể hiện trên ô người chơi. Cả hai đều tùy chọn và cấu hình được trong tùy chọn.'] }
      ]
    },
    {
      id: 'offline', icon: '\uD83C\uDFCB\uFE0F', title: 'Chế độ luyện tập',
      sections: [
        { id: 'what', t: 'Đây là gì',
          b: ['Chế độ Cục bộ / luyện tập là một ván đấu đầy đủ với các đối thủ do máy điều khiển: không cần kết nối, không cần tài khoản, không mất gì cả. Khi ứng dụng đã được cài (hoặc thậm chí chỉ mới truy cập một lần), nó chạy hoàn toàn ngoại tuyến — rất hợp để học luật, thử giao diện hoặc giết thời gian ở chế độ máy bay.'] },
        { id: 'setup', t: 'Thiết lập ván đấu',
          b: ['Chọn số đối thủ, chồng phỉnh khởi đầu, các blind và cách chúng tăng, cùng tốc độ ván đấu. Thành phần và độ khó của bot được chỉnh ở Tùy chọn nâng cao \u2192 Ván cục bộ — từ những đối thủ hiền lành đến một bàn khó và đa dạng hơn.'] },
        { id: 'trophies', t: 'Cúp',
          b: ['Chế độ luyện tập có tiến trình riêng: 28 cúp thuộc sáu nhóm (tiến trình, kỹ thuật, phong cách, thể thức, vui vẻ và một nhóm bí mật) được mở khóa khi bạn chơi — số ván bài đã chơi, ván đấu đã thắng, những cú bluff lớn, các bộ bài đặc biệt và hơn nữa. Tiến trình cúp là tích lũy và được hợp nhất giữa các thiết bị khi bật đồng bộ thiết lập tài khoản.'] },
        { id: 'learn', t: 'Nơi tốt để học',
          b: ['Mọi thứ mô tả ở các chương khác đều chạy được ở đây: bộ theo dõi xác suất, phần hiển thị trợ lý, chọn trước hành động, phím tắt bàn phím. Chế độ luyện tập là nơi tốt nhất để thử chúng mà không áp lực, trước khi bước vào pokerth.net.'] }
      ]
    },
    {
      id: 'style', icon: '\uD83C\uDFA8', title: 'Kiểu dáng và âm thanh',
      sections: [
        { id: 'themes', t: 'Chủ đề',
          b: ['Mục Kiểu dáng trong Tùy chọn nâng cao khoác áo cho toàn bộ ứng dụng. Các thiết lập sẵn cấu hình mọi thứ chỉ với một lần chạm (sòng bạc xanh cổ điển, diện mạo chính thức của PokerTH\u2026); bên dưới, từng trục riêng tinh chỉnh bảng màu, mặt bàn và mặt lá bài một cách độc lập — đổi bất kỳ trục nào và tổ hợp của bạn trở thành một chủ đề tùy chỉnh. Chế độ tối, sáng hay tự động được chọn ở Giao diện người dùng, và lựa chọn của bạn có hiệu lực ngay lập tức, trên mọi màn hình, và được ghi nhớ.'] },
        { id: 'tablelook', t: 'Bàn, bộ bài, chỗ ngồi',
          b: ['Ngoài chủ đề, nhiều thành phần có thể đổi độc lập: nền bàn, bộ bài, mặt lưng lá bài (tự khớp với bộ bài, hoặc nhập ảnh của riêng bạn), phỉnh người chia và phỉnh blind, kiểu nút hành động, cùng những gói chỗ ngồi trọn vẹn khoác áo mới cho các ô người chơi. Hãy chọn tất cả ở Tùy chọn nâng cao \u2192 Kiểu dáng; thay đổi hiện ra ngay trên bàn.'] },
        { id: 'music', t: 'Trình phát nhạc',
          b: ['Mục nhạc trong các menu tiêu đề mở một trình phát nhạc nền nhỏ: chọn bài từ danh sách, phát/tạm dừng, trước/sau, phát ngẫu nhiên, và lặp một bài, cả danh sách hoặc không lặp. Âm lượng, bài đang chọn và chế độ lặp đều được ghi nhớ. Nhạc không bao giờ tự phát — trình duyệt đòi hỏi một lần chạm — và trình phát hoàn toàn độc lập với hiệu ứng âm thanh của ván đấu.'] },
        { id: 'sounds', t: 'Hiệu ứng âm thanh',
          b: ['Âm thanh trong ván đấu được xếp thành bốn nhóm bật tắt riêng, đúng như ứng dụng máy tính: hành động trong ván (chia bài, Check, Call, Raise, đến lượt bạn\u2026), thông báo trò chuyện sảnh, thông báo ván đấu mạng (người chơi kết nối, ván sẵn sàng) và thông báo blind tăng. Một thanh trượt âm lượng duy nhất điều khiển tất cả, ở Tùy chọn nâng cao \u2192 Âm thanh.'],
          note: 'Mọi trình duyệt — nhất là iOS — đều từ chối phát âm thanh trước khi bạn chạm vào trang một lần. Nếu ván đấu bắt đầu trong im lặng, chỉ một lần chạm ở bất cứ đâu sẽ đánh thức âm thanh; ứng dụng cũng tự sửa bộ máy âm thanh khi iOS tạm ngưng nó (có cuộc gọi đến, chạy nền\u2026).' },
        { id: 'voice', t: 'Giọng nói và rung',
          b: ['Hai kênh bổ sung có thể giúp bạn nắm tình hình mà không cần nhìn màn hình: thông báo bằng giọng nói đọc to các sự kiện trong ván đấu qua bộ tổng hợp giọng nói của thiết bị, và trên điện thoại một rung ngắn có thể báo đến lượt bạn. Cả hai đều là phần mở rộng web, mặc định bật hay tắt tùy thiết bị, ở Tùy chọn nâng cao \u2192 Cược và lượt.'],
          note: 'Rung hoạt động trên Android (trình duyệt Chromium); Apple không mở API rung cho trang web, nên iPhone không rung được. Thông báo bằng giọng nói chạy ở mọi nơi, nhưng giọng và ngôn ngữ có sẵn phụ thuộc hệ thống của bạn — ứng dụng sẽ dùng lựa chọn khớp nhất mà nó tìm được.' }
      ]
    },
    {
      id: 'options', icon: '\u2699\uFE0F', title: 'Tùy chọn và phím tắt',
      sections: [
        { id: 'where', t: 'Tùy chọn nằm ở đâu',
          b: ['Tùy chọn nâng cao mở từ mục bánh răng trong bất kỳ menu tiêu đề nào. Chúng được nhóm như ở ứng dụng máy tính: Giao diện người dùng, Kiểu dáng, Âm thanh, Ván cục bộ, Ván mạng, Ván internet, Biệt danh / Ảnh đại diện, Thông điệp nhật ký, và Khôi phục mặc định. Mỗi tính năng riêng của bản web đều có công tắc riêng ở đó, nên bạn tắt được mọi thứ mình không dùng.'] },
        { id: 'cfgxml', t: 'Trao đổi thiết lập với ứng dụng máy tính',
          b: ['Thiết lập của bạn có thể đi lại giữa các ứng dụng: mục Thông điệp nhật ký cho phép xuất/nhập tệp config.xml chính thức (chính là \u007e/.pokerth/config.xml mà ứng dụng máy tính và QML vẫn dùng). Việc xuất ghi các thiết lập dùng chung — tên, tùy chọn hiển thị, âm thanh, sở thích bàn chơi, blind, kiểu dáng — còn việc nhập áp dụng tệp từ máy tính vào đây. Những thiết lập mà ứng dụng này không biết vẫn được giữ nguyên trong tệp.'] },
        { id: 'sync', t: 'Thiết lập đi theo bạn',
          b: ['Khi chơi bằng tài khoản, các tùy chọn, chủ đề, gán phím, ngôn ngữ và cúp luyện tập của bạn đều được đồng bộ: đổi gì đó trên một thiết bị và thiết bị tiếp theo bạn đăng nhập sẽ nhận được. Tiến trình cúp được hợp nhất, không bao giờ bị ghi đè, nên chơi trên hai thiết bị luôn giữ lại phần tốt nhất của cả hai.'] },
        { id: 'updates', t: 'Luôn cập nhật',
          b: ['Ứng dụng tự cập nhật: khi có phiên bản mới, một dải thông báo mời bạn tải lại (hoặc gõ /update trong khung trò chuyện để kiểm tra thủ công). Thỉnh thoảng một khảo sát sản phẩm nhỏ có thể xuất hiện để hỏi ý kiến bạn về một tính năng — tham gia là tùy ý, và khảo sát có thể tắt hoàn toàn ở Tùy chọn nâng cao \u2192 Cộng đồng.'] },
        { id: 'fkeys', t: 'Phím tắt bàn phím chính thức',
          b: ['Các phím chức năng chính thức của PokerTH hoạt động trong ván đấu:'],
          keys: [
            ['F1 / F2 / F3 / F4', 'Fold \u00b7 Check/Call \u00b7 Bet/Raise \u00b7 All-In (thứ tự có thể đảo trong tùy chọn)'],
            ['F5', 'Lật bài của bạn (khi có thể)'],
            ['F6 / F7 / F8', 'Thủ công \u00b7 Auto Check/Fold \u00b7 Auto Check/Call'],
            ['Alt+M / Alt+K / Alt+F', 'Thủ công \u00b7 Auto Check/Call \u00b7 Auto Check/Fold'],
            ['Alt+C / Alt+L / Alt+I', 'Trò chuyện \u00b7 Nhật ký \u00b7 Bảng xác suất'],
            ['F11', 'Toàn màn hình']],
          note: 'Phím tắt cần bàn phím vật lý. Trên Mac, các phím F mặc định điều khiển đa phương tiện: giữ Fn (hoặc bật \u201cDùng các phím F1, F2, v.v. làm phím chức năng chuẩn\u201d trong cài đặt macOS). Trên iPhone, chế độ toàn màn hình bị iOS hạn chế — cài ứng dụng dưới dạng PWA sẽ cho trải nghiệm toàn màn hình tương đương.' },
        { id: 'webkeys', t: 'Phím chữ của bản web',
          b: ['Phần mở rộng web: các phím một chữ cái cũng kích hoạt hành động và có thể gán lại ở Tùy chọn nâng cao \u2192 Phím tắt bàn phím:'],
          keys: [
            ['F', 'Fold'],
            ['C', 'Check / Call'],
            ['R', 'Raise'],
            ['A', 'All-In'],
            ['1 / 2 / 3', 'Bet 1/3 \u00b7 1/2 \u00b7 Pot'],
            ['Esc', 'Đóng cửa sổ trên cùng (nút Quay lại của Android cũng vậy)']],
          note: 'Trên Android, nút/cử chỉ Quay lại của hệ thống đóng cửa sổ như Esc thay vì rời ván đấu (có thể chỉnh trong tùy chọn). iOS không có nút hệ thống tương đương — hãy dùng dấu \u2715 của từng cửa sổ.' }
      ]
    }
  ]
};
