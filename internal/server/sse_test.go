package server

import "testing"

func TestParseLastEventID(t *testing.T) {
	cases := []struct {
		header string
		want   int
	}{
		{"", 0},
		{"0", 0},
		{"5", 5},
		{"42", 42},
		{"-1", 0},
		{"abc", 0},
		{"3.14", 0},
		{" 10 ", 0},
	}
	for _, tt := range cases {
		got := parseLastEventID(tt.header)
		if got != tt.want {
			t.Fatalf("parseLastEventID(%q) = %d, want %d", tt.header, got, tt.want)
		}
	}
}
