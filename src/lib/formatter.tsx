import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.locale('en')
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Singapore')

export const FormatDate = (date: Date | Dayjs | undefined, format = 'DD MMMM YYYY') =>
    dayjs(date).tz().format(format)

export const FormatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        maximumFractionDigits: 2,
        currency,
    }).format(amount)
}
