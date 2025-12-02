# FPT Event Management System - Frontend

Hệ thống quản lý sự kiện trong trường FPT do CLB hoặc Phòng ban tổ chức (workshop, talkshow).

## Tính năng

### Cho tất cả người dùng:
- ✅ Xem danh sách sự kiện
- ✅ Xem chi tiết sự kiện
- ✅ Đăng ký tham gia sự kiện
- ✅ Xem vé QR của mình
- ✅ Dashboard tổng quan

### Cho Sinh viên (Student):
- ✅ Đăng ký tham gia sự kiện
- ✅ Xem và tải vé QR
- ✅ Xem lịch sử đăng ký

### Cho Người tổ chức (Event Organizer):
- ✅ CRUD sự kiện (Tạo, Xem, Sửa, Xóa)
- ✅ Quản lý ghế ngồi
- ✅ Check-in người tham dự bằng QR code
- ✅ Xem báo cáo tham dự

### Cho Nhân viên (Staff):
- ✅ Tất cả quyền của Event Organizer
- ✅ Xem báo cáo tổng hợp
- ✅ Xuất báo cáo

## Công nghệ sử dụng

- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Recharts** - Charts/Graphs
- **QRCode.react** - QR code generation
- **react-qr-reader** - QR code scanning
- **date-fns** - Date formatting

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Chạy development server:
```bash
npm run dev
```

3. Build cho production:
```bash
npm run build
```

## Cấu trúc dự án

```
src/
├── components/       # Các component dùng chung
│   └── Layout.tsx   # Layout chính với navigation
├── contexts/        # React Context
│   └── AuthContext.tsx  # Quản lý authentication
├── data/           # Mock data
│   └── mockData.ts
├── pages/          # Các trang chính
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Events.tsx
│   ├── EventDetail.tsx
│   ├── EventCreate.tsx
│   ├── EventEdit.tsx
│   ├── MyTickets.tsx
│   ├── TicketDetail.tsx
│   ├── CheckIn.tsx
│   ├── SeatManagement.tsx
│   └── Reports.tsx
├── types/          # TypeScript types
│   └── event.ts
├── App.tsx         # Main app component
├── main.tsx        # Entry point
└── index.css       # Global styles
```

## Vai trò người dùng

### Student (Sinh viên)
- Email: `student@fpt.edu.vn`
- Có thể đăng ký sự kiện và xem vé của mình

### Event Organizer (Người tổ chức)
- Email: `organizer@fpt.edu.vn`
- Có thể tạo, sửa, xóa sự kiện
- Quản lý check-in và ghế ngồi

### Staff (Nhân viên)
- Email: `staff@fpt.edu.vn`
- Có tất cả quyền của Event Organizer
- Xem báo cáo tổng hợp

## Demo

1. Đăng nhập với bất kỳ email/password nào (chọn vai trò)
2. Xem danh sách sự kiện
3. Đăng ký tham gia sự kiện (nếu là Student)
4. Tạo sự kiện mới (nếu là Organizer/Staff)
5. Check-in bằng QR code (nếu là Organizer/Staff)
6. Xem báo cáo (nếu là Staff)

## Lưu ý

- Hiện tại chỉ có giao diện frontend, chưa có backend
- Dữ liệu được lưu trong mockData.ts
- Authentication chỉ là mock, không có thực sự
- QR code scanner cần camera để hoạt động

## License

MIT

