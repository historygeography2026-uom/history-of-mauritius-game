import useSWR from "swr"

const fetcher = (url: string) => {
  const controller = new AbortController()
  const fetchPromise = fetch(url, { signal: controller.signal })
    .then((res) => res.json())
    .catch((error) => {
      if (error.name !== 'AbortError') {
        throw error
      }
    })
  ;(fetchPromise as any).cancel = () => controller.abort()
  return fetchPromise
}

export function useQuestions(subject: string, level: string) {
  const { data, error, isLoading, mutate } = useSWR(
    subject && level ? `/api/questions?subject=${subject}&level=${level}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 60 seconds
    },
  )

  return {
    questions: data,
    isLoading,
    error,
  }
}
