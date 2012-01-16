#!/usr/bin/perl

use Modern::Perl;
use Garden;
use JSON;

sub slurp {
  my $filename = shift;
  my $text = do { local( @ARGV, $/ ) = $filename ; <> } ;
  return $text;
}

sub output_html {
  my ($page, $html) = @_;
  my $outfile = "$page.html";
  open(my $file, '>', $outfile);
  print $file $html;
  close $file;
}

my $config = decode_json(slurp('./src/config.json'));
my $garden = Garden->new(paths=>['./src']);

## Okay, now let's build the statuses data.
my $statuses = $config->{statuses};
my $projects = $config->{projects};
## Sort projects into appropriate categories.
my $stat = {}; ## A cache of statuses, used to populate projects.
for my $status (@{$statuses}) {
  my $sid = $status->{id};
  $status->{items} = []; ## Here we shall store our items.
  $stat->{$sid} = $status;
}

## we're case insensitive now, and sorted by name, rather than project id.
my @pkeys = 
  sort { lc $projects->{$a}->{name} cmp lc $projects->{$b}->{name} } 
  keys %{$projects};

for my $pid (@pkeys) {
  my $project = $projects->{$pid};
  if (!exists $project->{links}) {
    $project->{src} = $pid;
  }
  my $is = $project->{is};
  push(@{$stat->{$is}->{items}}, $project);
}

say "Building page.";

my $updated = $config->{updated};
my $tocpage = $garden->get('index');
my $tochtml = $tocpage->render(updated=>$updated, statuses=>$statuses);
output_html('index', $tochtml);

say "Done building page.";

