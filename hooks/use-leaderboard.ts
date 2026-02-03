import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useLeaderboard(subject = "all") {
  const { data, error, isLoading } = useSWR(`/api/leaderboard?subject=${subject}`, fetcher, {
    revalidateOnFocus: false,
  })

  return {
    leaderboard: data,
    isLoading,
    error,
  }
}
