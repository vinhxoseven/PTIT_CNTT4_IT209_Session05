# Bài 3 — Thực hành conflict khi rebase

Repo đã dựng sẵn lịch sử và đang đứng ở nhánh `feature-api`.
Rebase chưa được bắt đầu: bạn sẽ tự thực hiện và sửa conflict ở từng commit.

## Base code

- `server.js`: API Node.js dùng thư viện có sẵn, không cần `npm install`.
- `config.json`: cấu hình cổng, debug và môi trường.
- `homework/session_05/ex3/README.md`: mẫu báo cáo để bạn điền khi thực hành.

Chạy API bằng Node.js 18 trở lên:

```powershell
npm start
```

Trước rebase, nhánh feature chạy ở `http://127.0.0.1:9000`.
Thử `GET /health` hoặc `GET /api/hello` bằng trình duyệt.
Dừng server bằng `Ctrl+C` trước khi đổi nhánh hoặc sửa cấu hình.

## Lịch sử đã chuẩn bị

```text
                    update port on main -- add env config       (main)
                   /
init config -------
                   \
                    feat: change port -- feat: enable debug     (feature-api)
```

| Commit | Thay đổi trong config.json |
| --- | --- |
| `init config` | `port: 8080`, `debug: false` |
| `update port on main` | `port: 8081` |
| `add env config` | Thêm `env: "production"` |
| `feat: change port` | `port: 9000` |
| `feat: enable debug` | `debug: true` |

Các dòng được đặt sát nhau để commit debug cũng xung đột với phần cấu hình
main đã thêm. Git sẽ dừng riêng ở từng commit feature.

## Bắt đầu thực hành

Chạy tại thư mục repo:

```powershell
git status
git log --graph --oneline --all --decorate
git rebase main
```

Ở mỗi lần dừng:

1. Chạy `git status` và `git rebase --show-current-patch` để xác định commit đang áp dụng.
2. Mở `config.json`, đọc cả hai phần giữa các dấu conflict.
3. Sửa thủ công thành JSON hợp lệ, xóa các dòng `<<<<<<<`, `=======`, `>>>>>>>`.
4. Ghi nhận conflict và quyết định của bạn vào báo cáo.
5. Chạy:

```powershell
git add config.json
git rebase --continue
```

Nếu Git mở trình soạn thảo thông điệp commit, giữ thông điệp, lưu rồi đóng.
Với Vim: nhấn `Esc`, gõ `:wq`, nhấn Enter.
Lặp lại cho lần dừng thứ hai.

## Gợi ý giải quyết

- Lần 1: so sánh cổng `8081` trên main với `9000` của feature; giữ trường
  `env: "production"` mà main đã thêm.
- Lần 2: tích hợp thay đổi `debug: true`, đồng thời giữ cấu hình cổng đã chọn
  và trường `env` của main.
- Để bài tập có đủ hai commit feature sau rebase, có thể chọn cổng `9000`
  cho API tính năng. Nếu chỉ giữ `8081` ở lần 1, commit chỉ đổi cổng sẽ trở
  thành rỗng; đó là tình huống khác với kết quả hai commit của bài tập này.
- Trong rebase, `ours` là phía lịch sử đích (main cùng các commit đã phát lại),
  còn `theirs` là commit feature đang phát lại. Không dùng lệnh chọn toàn bộ
  một phía; hãy tích hợp từng trường thủ công.
- Nhánh `main` phải giữ nguyên lịch sử và cấu hình của nó. Không dùng merge
  để hoàn tất bài tập.

## Kiểm tra sau khi hoàn tất

```powershell
git status
git log --graph --oneline
git log --oneline main..feature-api
git merge-base --is-ancestor main feature-api
git show main:config.json
node -e "console.log(require('./config.json'))"
npm start
```

Kết quả mong đợi:

- Không còn rebase đang chạy. Working tree sạch sau khi bạn commit báo cáo.
- Hai commit feature nằm ngay trên hai commit mới của main, không có merge commit.
- `git merge-base --is-ancestor` trả mã thoát `0` (`$LASTEXITCODE` trong PowerShell).
- Main vẫn có `port: 8081`, `debug: false`, `env: "production"`.
- Feature giữ `env: "production"` và các quyết định tích hợp bạn đã ghi nhận.
- API hoạt động; `/health` trả đúng cấu hình sau rebase.

Sau khi rebase xong, chụp màn hình `git log --graph --oneline` và lưu thành
`homework/session_05/ex3/git-log-final.png`. Điền mẫu báo cáo rồi commit:

```powershell
git add homework/session_05/ex3
git commit -m "docs: report rebase conflict resolution"
```

Commit báo cáo sẽ nằm sau hai commit feature. Repo này chưa có GitHub remote;
bạn có thể thêm remote của mình để nộp bài.

## Bắt đầu lại nếu cần

Khi rebase đang chạy, có thể quay lại trạng thái trước khi bắt đầu bằng:

```powershell
git rebase --abort
```

Lệnh này bỏ các thay đổi xử lý conflict chưa hoàn tất. Nếu đã hoàn tất rebase,
hãy dùng `git reflog` để tìm trạng thái cũ trước khi quyết định khôi phục.
