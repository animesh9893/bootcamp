PID=$(lsof -i :$1 | awk 'NR==2 {print $2}')

# echo $PID
# Kill the process if it was found
if [ -n "$PID" ]; then
    echo "Killing process with PID $PID"
    kill -9 $PID
else
    echo "All good to go $1"
fi


node server.js