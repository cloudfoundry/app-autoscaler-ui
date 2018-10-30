package helpers

import (
	"io"
	"sync"

	"code.cloudfoundry.org/lager"
)

type redactingWriterWithURLCredSink struct {
	writers                 []io.Writer
	minLogLevel             lager.LogLevel
	writeL                  *sync.Mutex
	jsonRedacterWithURLCred *JSONRedacterWithURLCred
}

func NewRedactingWriterWithURLCredSink(writers []io.Writer, minLogLevel lager.LogLevel, keyPatterns []string, valuePatterns []string) (lager.Sink, error) {
	jsonRedacterWithURLCred, err := NewJSONRedacterWithURLCred(keyPatterns, valuePatterns)
	if err != nil {
		return nil, err
	}
	return &redactingWriterWithURLCredSink{
		writers:                 writers,
		minLogLevel:             minLogLevel,
		writeL:                  new(sync.Mutex),
		jsonRedacterWithURLCred: jsonRedacterWithURLCred,
	}, nil
}

func (sink *redactingWriterWithURLCredSink) Log(log lager.LogFormat) {
	if log.LogLevel < sink.minLogLevel {
		return
	}
	timeLogFormat := NewTimeLogFormat(log)
	sink.writeL.Lock()
	defer sink.writeL.Unlock()
	v := timeLogFormat.ToJSON()
	rv := sink.jsonRedacterWithURLCred.Redact(v)
	for _, w := range sink.writers {
		w.Write(rv)
		w.Write([]byte("\n"))
	}

}
