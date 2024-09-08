"use client"
import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { format, getDay } from "date-fns"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// 模擬的每週課表數據
const weeklySchedule = {
  1: [  // 星期一
    { time: "08:00-09:45", subject: "歷史",class:"C501" },
    { time: "09:55-11:40", subject: "英文",class:"C501"},
    { time: "14:40-16:25", subject: "音樂" ,class:"C305"},
  ],
  2: [  // 星期二
    { time: "08:00-09:45", subject: "生物" ,class:"C501"},
    { time: "09:55-11:40", subject: "地理",class:"C501" },
    { time: "14:40-16:25", subject: "物理" ,class:"C501"},
  ],
  3: [  // 星期三
    { time: "08:00-09:45", subject: "公民" ,class:"C501"},
    { time: "09:55-10:45", subject: "馬偕文史",class:"C501" },
    { time: "10:50-11:40", subject: "全民國防",class:"C501" },
    { time: "12:45-14:30", subject: "數學" ,class:"C501"},
    { time: "14:40-16:25", subject: "國文" ,class:"C501"},
  ],
  4: [  // 星期四
    { time: "08:00-08:50", subject: "健康與護理" ,class:"C308"},
    { time: "08:55-09:45", subject: "體育",class:"大操場" },
    { time: "09:55-11:40", subject: "人體解剖學",class:"實驗室" },
    { time: "12:45-15:30", subject: "資訊素養" ,class:"電腦教室"},
  ],
}

// 模擬的特定日期行程數據
const dailyEvents = {
  "2024-09-08": [
    { time: "15:00", description: "讀書會" },
    { time: "18:00", description: "家長會" },
  ],
  "2024-09-09": [
    { time: "16:30", description: "牙醫預約" },
  ],
  // ... 其他日期的行程
}

const ScheduleDialog = ({ isOpen, onClose, date, schedule, events }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{format(date, "yyyy年MM月dd日")} ({['日', '一', '二', '三', '四', '五', '六'][getDay(date)]}) 的安排</DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        <h3 className="font-bold text-lg mb-2">課表：</h3>
        {schedule.length > 0 ? (
          schedule.map((item, index) => (
            <div key={index} className="mb-2">
              <span className="font-semibold">時間:{item.time}</span>,科目: {item.subject},教室: {item.class}
            </div>
          ))
        ) : (
          <p>今天沒有課程安排。</p>
        )}
        <h3 className="font-bold text-lg mt-4 mb-2">行程：</h3>
        {events.length > 0 ? (
          events.map((item, index) => (
            <div key={index} className="mb-2">
              <span className="font-semibold">{item.time}</span>: {item.description}
            </div>
          ))
        ) : (
          <p>今天沒有特別的行程安排。</p>
        )}
      </div>
    </DialogContent>
  </Dialog>
)

const HomePage = () => {
  const [selectedDate, setSelectedDate] = React.useState(new Date())
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setIsDialogOpen(true)
  }

  const getScheduleForDate = (date) => {
    const dayOfWeek = getDay(date)
    return weeklySchedule[dayOfWeek] || []
  }

  const getEventsForDate = (date) => {
    const formattedDate = format(date, "yyyy-MM-dd")
    return dailyEvents[formattedDate] || []
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">課表與行程日曆</h1>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        className="rounded-md border"
      />
      <ScheduleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        date={selectedDate}
        schedule={getScheduleForDate(selectedDate)}
        events={getEventsForDate(selectedDate)}
      />
    </div>
  )
}

export default HomePage