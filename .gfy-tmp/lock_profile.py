import ctypes, glob, os, time, sys
from ctypes import wintypes

k32 = ctypes.WinDLL("kernel32", use_last_error=True)
k32.CreateFileW.restype = ctypes.c_void_p
k32.CreateFileW.argtypes = [wintypes.LPCWSTR, wintypes.DWORD, wintypes.DWORD,
                            ctypes.c_void_p, wintypes.DWORD, wintypes.DWORD, ctypes.c_void_p]

GENERIC_READ = 0x80000000
OPEN_EXISTING = 3
INVALID = ctypes.c_void_p(-1).value

root = r"D:\code\resume bulder\tmp-chrome-profile"
files = [f for f in glob.glob(os.path.join(root, "**", "*"), recursive=True) if os.path.isfile(f)]
print("candidate files:", len(files))

handles = []
for f in files:
    h = k32.CreateFileW(f, GENERIC_READ, 0, None, OPEN_EXISTING, 0, None)
    if h and h != INVALID:
        handles.append(h)
print("locked handles:", len(handles))
sys.stdout.flush()

duration = int(sys.argv[1]) if len(sys.argv) > 1 else 60
time.sleep(duration)
print("released")
