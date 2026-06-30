package main

import (
	"container/list"
	"sync"
	"time"
)

type LogEntry struct {
	Time  string `json:"time"`
	Level string `json:"level"`
	Msg   string `json:"msg"`
}

type LogManager struct {
	mu    sync.RWMutex
	logs  *list.List
	max   int
}

func NewLogManager(max int) *LogManager {
	return &LogManager{
		logs: list.New(),
		max:  max,
	}
}

func (lm *LogManager) Add(level, msg string) {
	entry := LogEntry{
		Time:  time.Now().Format("2006-01-02 15:04:05"),
		Level: level,
		Msg:   msg,
	}
	lm.mu.Lock()
	defer lm.mu.Unlock()
	lm.logs.PushBack(entry)
	if lm.logs.Len() > lm.max {
		lm.logs.Remove(lm.logs.Front())
	}
}

func (lm *LogManager) GetAll(limit int) []LogEntry {
	lm.mu.RLock()
	defer lm.mu.RUnlock()
	count := lm.logs.Len()
	if limit > 0 && limit < count {
		count = limit
	}
	result := make([]LogEntry, 0, count)
	e := lm.logs.Back()
	for i := 0; i < count && e != nil; i++ {
		result = append([]LogEntry{e.Value.(LogEntry)}, result...)
		e = e.Prev()
	}
	return result
}

func (lm *LogManager) Clear() {
	lm.mu.Lock()
	defer lm.mu.Unlock()
	lm.logs.Init()
}
