const Event = ({
  category,
  title,
  time,
}: {
  category: string;
  title: string;
  time: string;
}) => {
  return (
    <div className="event flex gap-x-3 items-center p-3 md:p-4 border rounded-lg max-lg:flex-wrap gap-y-3">
      <div
        className="text-xs md:text-sm text-orange-500 bg-orange-100 rounded
          p-1 w-24 md:w-28 text-center truncate"
      >
        {category}
      </div>
      <div className="text-base max-w-24 md:max-w-28 truncate lg:text-lg">
        {title}
      </div>
      <div className="text-calypso-800 max-lg:text-base flex-grow text-left">
        {time}
      </div>
    </div>
  );
};

export default Event;
