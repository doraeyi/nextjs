"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { format, getDay, isValid, startOfDay, isSameDay } from "date-fns"
import { zhTW } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * @typedef {Object} ScheduleItem
 * @property {string} time
 * @property {string} subject
 * @property {string} class
 */

/**
 * @typedef {Object} EventItem
 * @property {string} time
 * @property {string} description
 */

// 模擬的每週課表數據
const weeklySchedule = {
  1: [
    { time: "08:00-09:45", subject: "歷史", class: "C501" },
    { time: "09:55-11:40", subject: "英文", class: "C501" },
    { time: "14:40-16:25", subject: "音樂", class: "C305" },
  ],
  2: [
    { time: "08:00-09:45", subject: "生物", class: "C501" },
    { time: "09:55-11:40", subject: "地理", class: "C501" },
    { time: "14:40-16:25", subject: "物理", class: "C501" },
  ],
  3: [
    { time: "08:00-09:45", subject: "公民", class: "C501" },
    { time: "09:55-10:45", subject: "馬偕文史", class: "C501" },
    { time: "10:50-11:40", subject: "全民國防", class: "C501" },
    { time: "12:45-14:30", subject: "數學", class: "C501" },
    { time: "14:40-16:25", subject: "國文", class: "C501" },
  ],
  4: [
    { time: "08:00-08:50", subject: "健康與護理", class: "C308" },
    { time: "08:55-09:45", subject: "體育", class: "大操場" },
    { time: "09:55-11:40", subject: "人體解剖學", class: "實驗室" },
    { time: "12:45-15:30", subject: "資訊素養", class: "電腦教室" },
  ],
  5: [
    { time: "08:00-09:45", subject: "化學", class: "C501" },
    { time: "09:55-11:40", subject: "英文", class: "C501" },
    { time: "14:40-16:25", subject: "數學", class: "C501" },
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
}

const ScheduleDialog = ({ isOpen, onClose, date, schedule, events }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-4xl">
    <DialogHeader>
      <DialogTitle>{format(date, "yyyy年MM月dd日")} ({['日', '一', '二', '三', '四', '五', '六'][getDay(date)]}) 的安排</DialogTitle>
    </DialogHeader>
    <div className="mt-4">
      <h3 className="font-bold text-lg mb-2">課表：</h3>
      {schedule.length > 0 ? (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-1 px-2 border-b text-center">時間</th>
              <th className="py-1 px-2 border-b text-center">科目</th>
              <th className="py-1 px-2 border-b text-center">教室</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-1 px-2 border-b text-center">{item.time}</td>
                <td className="py-1 px-2 border-b text-center">{item.subject}</td>
                <td className="py-1 px-2 border-b text-center">{item.class}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>今天沒有課程安排。</p>
      )}
      <h3 className="font-bold text-lg mt-4 mb-2">行程：</h3>
      {events.length > 0 ? (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-1 px-2 border-b text-center">時間</th>
              <th className="py-1 px-2 border-b text-center">描述</th>
            </tr>
          </thead>
          <tbody>
            {events.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-1 px-2 border-b text-center">{item.time}</td>
                <td className="py-1 px-2 border-b text-center">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>今天沒有特別的行程安排。</p>
      )}
    </div>
  </DialogContent>
</Dialog>
)

const HomePage = () => {
  const [currentDate, setCurrentDate] = React.useState(() => {
    const now = startOfDay(new Date())
    console.log("Initial currentDate:", now)
    return now
  })
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const now = startOfDay(new Date())
    console.log("Initial selectedDate:", now)
    return now
  })
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  React.useEffect(() => {
    const updateDate = () => {
      const now = startOfDay(new Date())
      console.log("Checking date update. Current:", currentDate, "New:", now)
      if (!isSameDay(now, currentDate)) {
        console.log("Updating date to:", now)
        setCurrentDate(now)
        setSelectedDate(now)
      }
    }

    updateDate() // 初始更新

    // 每分鐘檢查一次日期
    const intervalId = setInterval(updateDate, 60000)

    return () => clearInterval(intervalId)
  }, [currentDate])

  const handleDateSelect = (date) => {
    if (date && isValid(date)) {
      console.log("Selected date:", date)
      setSelectedDate(date)
      setIsDialogOpen(true)
    } else {
      console.error('Invalid date selected')
    }
  }

  const getScheduleForDate = React.useMemo(() => (date) => {
    if (!date || !isValid(date)) return []
    const dayOfWeek = getDay(date)
    return weeklySchedule[dayOfWeek] || []
  }, [])

  const getEventsForDate = React.useMemo(() => (date) => {
    if (!date || !isValid(date)) return []
    const formattedDate = format(date, "yyyy-MM-dd")
    return dailyEvents[formattedDate] || []
  }, [])

  console.log("Rendering with currentDate:", currentDate)

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">課表與行程日曆</h1>
      <div className="text-lg mb-2">
        今天是：{format(currentDate, "yyyy年MM月dd日 (EEEE)", { locale: zhTW })}
      </div>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        className="rounded-md border"
        today={currentDate}
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