interface ProgressBarProps {
  percentage: number;
  height?: string;
  backgroundColor?: string;
  fillColor?: string;
}

const ProgressBar = ({ 
  percentage, 
  height = '20px',
  backgroundColor = '#e0e0e0',
  fillColor = '#4caf50'
}: ProgressBarProps) => {
  return (
    <div
      style={{
        height,
        width: '100%',
        backgroundColor,
        borderRadius: '10px',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${Math.min(100, Math.max(0, percentage))}%`,
          backgroundColor: fillColor,
          transition: 'width 0.3s ease-in-out'
        }}
      />
    </div>
  );
};

export default ProgressBar;
