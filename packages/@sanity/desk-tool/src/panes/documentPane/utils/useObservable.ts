import {useEffect, useRef, useState} from 'react'
import {Observable, Subscription} from 'rxjs'

export function useObservable<T = any>(stream: Observable<T>, initialValue?: T) {
  const subRef = useRef<Subscription | null>(null)
  const isFirstSubRef = useRef(true)

  const [value, setValue] = useState<T | null>(() => {
    let syncVal = typeof initialValue === 'undefined' ? null : initialValue

    let isSync = true

    subRef.current = stream.subscribe(nextVal => {
      if (isSync) {
        syncVal = nextVal
      } else {
        setValue(nextVal)
      }
    })

    isSync = false

    return syncVal
  })

  useEffect(() => {
    if (!isFirstSubRef.current) {
      subRef.current = stream.subscribe(setValue)
    }

    isFirstSubRef.current = false

    return () => {
      if (subRef.current) {
        subRef.current.unsubscribe()
        subRef.current = null
      }
    }
  }, [stream])

  return value
}
