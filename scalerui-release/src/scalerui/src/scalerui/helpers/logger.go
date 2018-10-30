package helpers

import (
	"fmt"
	"io"
	"os"

	"scalerui/config"

	"code.cloudfoundry.org/lager"
)

func InitLoggerFromConfig(conf *config.LoggingConfig, name string) lager.Logger {
	logLevel, err := getLogLevel(conf.Level)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to initialize logger: %s\n", err.Error())
		os.Exit(1)
	}
	logger := lager.NewLogger(name)
	keyPatterns := []string{"[Pp]wd", "[Pp]ass", "[Ss]ecret", "[Tt]oken"}
	writers := []io.Writer{os.Stdout}
	for _, logFilePath := range conf.FilePaths {
		filewrilter, err := os.OpenFile(logFilePath, os.O_APPEND|os.O_WRONLY|os.O_CREATE, os.ModePerm)
		if err != nil {
			continue
		}
		writers = append(writers, filewrilter)
	}

	redactedSink, err := NewRedactingWriterWithURLCredSink(writers, logLevel, keyPatterns, nil)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to create redacted sink: %s\n", err.Error())
		os.Exit(1)
	}
	logger.RegisterSink(redactedSink)

	return logger
}

func getLogLevel(level string) (lager.LogLevel, error) {
	switch level {
	case "debug":
		return lager.DEBUG, nil
	case "info":
		return lager.INFO, nil
	case "error":
		return lager.ERROR, nil
	case "fatal":
		return lager.FATAL, nil
	default:
		return -1, fmt.Errorf("Error: unsupported log level:%s", level)
	}
}
