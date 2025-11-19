interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const DateSelector = ({ selectedDate, onDateChange }: DateSelectorProps) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Select Date</label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="form-input w-full"
      />
    </div>
  );
};

export default DateSelector;
