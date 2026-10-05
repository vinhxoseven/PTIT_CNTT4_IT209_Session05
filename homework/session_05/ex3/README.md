# Bài 3: Xử lý xung đột phức tạp trong quá trình Rebase

> Báo cáo minh họa được kiểm chứng bằng cách rebase trên bản sao của repo `B3`. Repo gốc được giữ nguyên để học viên tiếp tục thực hành. Log dưới đây là kết quả thật của bản sao; mã commit khi tự làm có thể khác. Theo yêu cầu, báo cáo dùng log dạng văn bản thay cho ảnh chụp.

## 1. Kịch bản ban đầu

Hai nhánh cùng xuất phát từ commit `init config`, sau đó mỗi nhánh có hai commit riêng sửa `config.json`.

| Nhánh | Commit | Thay đổi |
| --- | --- | --- |
| Chung | `36634a6 init config` | `port: 8080`, `debug: false` |
| `feature-api` | `ad47bce feat: change port` | Đổi cổng thành `9000` |
| `feature-api` | `6688122 feat: enable debug` | Bật `debug: true` |
| `main` | `39ad85c update port on main` | Đổi cổng thành `8081` |
| `main` | `53068b1 add env config` | Thêm `env: "production"` |

Lệnh xem cả hai nhánh:

```bash
git log --graph --oneline --all --decorate
```

Lịch sử ban đầu của repo dùng để kiểm chứng:

```text
* 53068b1 (main) add env config
* 39ad85c update port on main
| * 6688122 (HEAD -> feature-api) feat: enable debug
| * ad47bce feat: change port
|/
* 36634a6 init config
```

## 2. Cách dựng kịch bản

Các bước khởi tạo dưới đây dành cho một thư mục mới, chưa có repo. Nếu dùng repo `B3` đã dựng sẵn, bắt đầu từ phần 3.

1. Chạy `git init -b main`, tạo `config.json` có nội dung:

```json
{
  "port": 8080,
  "debug": false
}
```

```bash
git add config.json
git commit -m "init config"
git checkout -b feature-api
```

2. Trên feature, sửa `port` thành `9000`, lưu file rồi commit:

```bash
git add config.json
git commit -m "feat: change port"
```

3. Tiếp tục sửa `debug` thành `true`, lưu file rồi commit:

```bash
git add config.json
git commit -m "feat: enable debug"
git checkout main
```

4. Trên main, file trở lại `port: 8080`, `debug: false`. Sửa `port` thành `8081`, lưu và commit:

```bash
git add config.json
git commit -m "update port on main"
```

5. Thêm `env` và dấu phẩy sau dòng debug để JSON hợp lệ:

```json
{
  "port": 8081,
  "debug": false,
  "env": "production"
}
```

```bash
git add config.json
git commit -m "add env config"
git checkout feature-api
git status
```

## 3. Conflict lần 1: feat: change port

Đứng ở `feature-api` và bắt đầu rebase:

```bash
git rebase main
```

Git dừng khi phát lại commit đầu tiên:

```text
Auto-merging config.json
CONFLICT (content): Merge conflict in config.json
Could not apply ad47bce... feat: change port
```

Kiểm tra trạng thái và commit đang áp dụng:

```bash
git status
git rebase --show-current-patch
cat config.json
```

Nội dung conflict thực tế:

> ```text
> {
> <<<<<<< HEAD
>   "port": 8081,
>   "debug": false,
>   "env": "production"
> =======
>   "port": 9000,
>   "debug": false
> >>>>>>> ad47bce (feat: change port)
> }
> ```

**Nguyên nhân:** main đổi cổng từ `8080` thành `8081`, còn feature đổi cùng dòng thành `9000`. Main cũng đã thêm trường `env` trong vùng cấu hình gần đó.

**Cách giải quyết:** mở file, sửa thủ công từng trường, chọn cổng `9000` cho API tính năng và giữ `env: "production"` từ main. Giữ `debug: false` vì commit bật debug chưa được phát lại. Xóa hết các dấu conflict và lưu:

```json
{
  "port": 9000,
  "debug": false,
  "env": "production"
}
```

```bash
git add config.json
git rebase --continue
```

Nếu Git mở trình soạn thảo thông điệp commit, giữ thông điệp rồi lưu và đóng. Với Vim: nhấn `Esc`, gõ `:wq`, nhấn Enter.

## 4. Conflict lần 2: feat: enable debug

Git phát lại commit thứ hai và dừng tiếp:

```text
Auto-merging config.json
CONFLICT (content): Merge conflict in config.json
Could not apply 6688122... feat: enable debug
```

```bash
git status
git rebase --show-current-patch
cat config.json
```

Nội dung conflict thực tế:

> ```text
> {
>   "port": 9000,
> <<<<<<< HEAD
>   "debug": false,
>   "env": "production"
> =======
>   "debug": true
> >>>>>>> 6688122 (feat: enable debug)
> }
> ```

**Nguyên nhân:** feature sửa dòng debug, trong khi main đã thêm dấu phẩy và trường env ngay cạnh dòng này. Hai thay đổi cùng tác động vào một vùng nội dung nên Git không tự tích hợp được.

**Cách giải quyết:** sửa thủ công thành `debug: true`, giữ cổng `9000` đã chọn ở chặng trước và trường env từ main. Xóa dấu conflict, lưu file:

```json
{
  "port": 9000,
  "debug": true,
  "env": "production"
}
```

```bash
git add config.json
git rebase --continue
```

Git báo hoàn tất:

```text
Successfully rebased and updated refs/heads/feature-api.
```

Quy trình này không dùng merge, không bỏ qua commit và không chọn toàn bộ một phía bằng `--ours` hoặc `--theirs`.

## 5. Kết quả kiểm tra và log sau cùng

### 5.1. Trạng thái rebase

```bash
git status
```

Phần kết quả kiểm tra working tree trên bản sao:

```text
nothing to commit, working tree clean
```

Rebase đã hoàn tất. Bản sao có nhánh theo dõi `origin/feature-api`, nên status còn thông báo nhánh diverge sau khi viết lại lịch sử. Đây là thông báo về nhánh theo dõi, không phải conflict chưa xử lý; không cần chạy `git pull` để hoàn tất bài tập.

### 5.2. Log dạng văn bản thay cho ảnh chụp

```bash
git log --graph --oneline
```

Kết quả thật trên bản sao sau rebase, trước khi thêm commit báo cáo:

```text
* 756c467 feat: enable debug
* 77dd957 feat: change port
* 53068b1 add env config
* 39ad85c update port on main
* 36634a6 init config
```

Hai commit feature nối tiếp ngay sau commit mới nhất của main. Lịch sử thẳng hàng, không có merge commit. Mã commit feature thay đổi vì chúng được phát lại với commit cha mới; mã commit main giữ nguyên.

### 5.3. Main giữ nguyên cấu hình và lịch sử

```bash
git show main:config.json
```

```json
{
  "port": 8081,
  "debug": false,
  "env": "production"
}
```

Đầu nhánh main trước và sau rebase đều là `53068b1017981649d428b31390ade44d0372f524`. Cổng `9000` chỉ được chọn trong cấu hình tích hợp trên feature; trường env của main vẫn được giữ trên feature.

Các kiểm tra bổ sung đã chạy:

```bash
git merge-base --is-ancestor main feature-api
git rev-list --count main..feature-api
git rev-list --count --merges feature-api
```

| Kiểm tra | Kết quả |
| --- | --- |
| Main là tổ tiên của feature-api | Mã thoát `0` |
| Số commit riêng của feature sau rebase | `2` |
| Số merge commit trong lịch sử feature | `0` |

## 6. So sánh Merge và Rebase

| Tiêu chí | Merge | Rebase |
| --- | --- | --- |
| Cách tích hợp | Tích hợp lịch sử hai nhánh | Phát lại từng commit feature trên nhánh đích |
| Conflict | Thường xử lý trong một lượt merge | Có thể xuất hiện ở từng commit được phát lại |
| Sau khi sửa | Stage file và hoàn tất merge | Stage file rồi chạy `git rebase --continue` |
| Lịch sử | Merge hai nhánh đã phân kỳ tạo merge commit | Commit feature được viết lại và nối sau main |
| Ours/theirs | Ours là nhánh hiện tại; theirs là nhánh được merge vào | Ours là phía nhánh đích cùng các commit đã phát lại; theirs là commit feature đang phát lại |

## 7. Nộp báo cáo

Tệp nằm tại `homework/session_05/ex3/README.md`. Sau khi tự hoàn tất rebase trên repo gốc, thay phần log kiểm chứng bằng log của mình nếu cần, rồi commit báo cáo:

```bash
git add homework/session_05/ex3/README.md
git commit -m "docs: report rebase conflict resolution"
```

Commit báo cáo sẽ nằm sau hai commit feature. Nếu cần hủy khi rebase còn đang chạy, dùng `git rebase --abort`; lệnh này bỏ các chỉnh sửa xử lý conflict và đưa nhánh về trạng thái trước rebase.
