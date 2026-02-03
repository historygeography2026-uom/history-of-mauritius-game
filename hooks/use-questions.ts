import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useQuestions(subject: string, level: string) {
  const { data, error, isLoading } = useSWR(
    subject && level ? `/api/questions?subject=${subject}&level=${level}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  return {
    questions: data,
    isLoading,
    error,
  }
}
