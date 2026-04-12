import base64
with open('c:/Users/padma/OneDrive/Desktop/project/momento/src/App.jsx', 'r', encoding='utf-8') as f:
    app_header = ''.join(f.readlines()[:235])
with open('c:/Users/padma/OneDrive/Desktop/project/momento/src/data/constants.jsx', 'r', encoding='utf-8') as f:
    constants = f.read()
def make_chunks(data, name):
    b = base64.b64encode(data.encode('utf-8')).decode('utf-8')
    chunks = [b[i:i+80] for i in range(0, len(b), 80)]
    print(f'# {name} Recovery Chunks')
    print(f'rm -f {name}.b64')
    for c in chunks:
        print(f'echo \"{c}\" >> {name}.b64')
    print('')
make_chunks(app_header, 'app_head')
make_chunks(constants, 'constants')
