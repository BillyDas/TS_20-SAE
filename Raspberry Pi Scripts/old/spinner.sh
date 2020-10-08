GREEN='\033[1;32m'
YELLOW='\033[0;31m'
RED='\033[0;31m'
LBLUE='\033[1;34m'
NOCOLOR='\033[0m'

echo -e 'Processing: '
# Start the spinner in the background.
# The background job's PID is stored in special variable `$!`.
tput civis
(while :; do for c in / - \\ \|; do printf '%b\b' "${LBLUE}$c"; sleep 0.5; done; done) &

# Run the synchronous (blocking) command.
# In this example we simply sleep for a few seconds.
sleep 3

# The blocking command has finished:
# Print a newline and kill the spinner job.
printf '%b\b' "${GREEN}Done.${NOCOLOR}";
{ printf '\n'; kill $! && wait $!; } 2>/dev/null
tput cnorm

